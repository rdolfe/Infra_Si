"""
Prédiction de prix immobilier — module analytics Ymmo.

Comble l'exigence du sujet : « Réaliser des analyses statistiques pour
identifier et faire des prévisions (prédictions de vente, zones
intéressantes où acheter...) ».

Pipeline : extraction SQL -> nettoyage pandas -> modèle scikit-learn
(régression Ridge sur les caractéristiques du bien) -> estimation de prix
et détection des « bonnes affaires » (biens publiés sous leur prix estimé).

INSTALLATION DANS LE PROJET
---------------------------
1. Copier ce fichier dans  backend/app/analytics/price_prediction.py
2. Dans backend/app/routers/analytics.py, ajouter :

    from app.analytics.price_prediction import predict_price, find_deals

    @router.get("/price-estimate")
    def price_estimate(
        surface: float, rooms: int, type: str, lat: float, lng: float,
        db: Session = Depends(get_db),
    ):
        return predict_price(db, surface=surface, rooms=rooms,
                             property_type=type, lat=lat, lng=lng)

    @router.get("/deals")
    def deals(db: Session = Depends(get_db)):
        return _cached("deals", find_deals, db)

3. pandas et scikit-learn sont déjà dans requirements.txt : rien à installer.
"""

from __future__ import annotations

import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sqlalchemy.orm import Session

from app.models.property import Property, PropertyStatus

NUMERIC = ["surface", "rooms", "lat", "lng"]
CATEG = ["type"]
MIN_SAMPLES = 30  # en dessous, le modèle n'est pas significatif


def _load_dataframe(db: Session) -> pd.DataFrame:
    """Extrait les biens exploitables et les charge dans un DataFrame pandas."""
    rows = (
        db.query(
            Property.price,
            Property.surface,
            Property.rooms,
            Property.type,
            Property.lat,
            Property.lng,
            Property.status,
            Property.id,
            Property.title,
        )
        .filter(Property.status.in_([PropertyStatus.published, PropertyStatus.sold]))
        .all()
    )
    df = pd.DataFrame(rows, columns=[
        "price", "surface", "rooms", "type", "lat", "lng", "status", "id", "title"
    ])
    return df


def _clean(df: pd.DataFrame) -> pd.DataFrame:
    """Nettoyage des données (exigence « nettoyer et mettre à disposition »).

    - suppression des lignes incomplètes (géolocalisation ou prix manquants)
    - conversion des types
    - suppression des valeurs aberrantes de prix au m² (1er/99e percentile)
    """
    df = df.dropna(subset=["price", "surface", "rooms", "lat", "lng"]).copy()
    df["price"] = df["price"].astype(float)
    df["type"] = df["type"].astype(str)
    df = df[df["surface"] > 5]  # surfaces incohérentes
    df["price_m2"] = df["price"] / df["surface"]
    low, high = df["price_m2"].quantile([0.01, 0.99])
    df = df[df["price_m2"].between(low, high)]
    return df.drop(columns=["price_m2"])


def _build_model() -> Pipeline:
    """Régression Ridge avec normalisation des numériques et one-hot des types."""
    pre = ColumnTransformer([
        ("num", StandardScaler(), NUMERIC),
        ("cat", OneHotEncoder(handle_unknown="ignore"), CATEG),
    ])
    return Pipeline([("pre", pre), ("reg", Ridge(alpha=1.0))])


def _train(db: Session):
    df = _clean(_load_dataframe(db))
    if len(df) < MIN_SAMPLES:
        return None, None, df
    X = df[NUMERIC + CATEG]
    y = df["price"]
    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42)
    model = _build_model().fit(X_tr, y_tr)
    mae = float(mean_absolute_error(y_te, model.predict(X_te)))
    return model, mae, df


def predict_price(db: Session, *, surface: float, rooms: int,
                  property_type: str, lat: float, lng: float) -> dict:
    """Estime le prix d'un bien à partir de ses caractéristiques."""
    model, mae, df = _train(db)
    if model is None:
        return {
            "estimated_price": None,
            "detail": f"Pas assez de données ({len(df)} biens, minimum {MIN_SAMPLES}).",
        }
    X = pd.DataFrame([{
        "surface": surface, "rooms": rooms, "type": property_type,
        "lat": lat, "lng": lng,
    }])
    estimate = float(model.predict(X)[0])
    return {
        "estimated_price": round(max(estimate, 0.0), 2),
        "mae": round(mae, 2),                 # erreur absolue moyenne du modèle
        "training_samples": int(len(df)),
        "model": "Ridge regression (scikit-learn)",
    }


def find_deals(db: Session, top: int = 10) -> list[dict]:
    """Identifie les biens publiés dont le prix est le plus bas par rapport
    au prix estimé par le modèle : « bonnes affaires / zones où acheter »."""
    model, _mae, df = _train(db)
    if model is None:
        return []
    pub = df[df["status"] == PropertyStatus.published].copy()
    if pub.empty:
        return []
    pub["estimated"] = model.predict(pub[NUMERIC + CATEG])
    pub["delta_pct"] = (pub["estimated"] - pub["price"]) / pub["estimated"] * 100
    best = pub.sort_values("delta_pct", ascending=False).head(top)
    return [
        {
            "property_id": r.id,
            "title": r.title,
            "price": round(float(r.price), 2),
            "estimated_price": round(float(r.estimated), 2),
            "below_market_pct": round(float(r.delta_pct), 1),
        }
        for r in best.itertuples()
    ]
