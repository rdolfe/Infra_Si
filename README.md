# Ymmo – Plateforme Immobilière

Plateforme web centralisée pour l'achat et la vente de biens immobiliers, développée pour le groupe Ymmo (12 agences en France).

## Stack technique

| Couche | Technologie |
|---|---|
| Backend | Python 3.12 + FastAPI |
| Frontend | Next.js 14 (App Router) |
| Base de données | PostgreSQL 16 + PostGIS |
| Analyse de données | pandas + scikit-learn |
| Cartes | Leaflet / react-leaflet |
| Déploiement | Docker Compose |

## Démarrage rapide

### Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installé et démarré
- Git

### Installation

```bash
# 1. Cloner le dépôt
git clone <url-du-repo>
cd ymmo

# 2. Copier le fichier d'environnement
cp .env.example .env
# Éditer .env si nécessaire (les valeurs par défaut fonctionnent en local)

# 3. Lancer tous les services
docker compose up --build
```

Les services sont disponibles sur :
- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:8000
- **Docs API (Swagger)** : http://localhost:8000/docs
- **PostgreSQL** : localhost:5432

### Migrations de base de données

```bash
# Appliquer les migrations Alembic
docker compose exec backend alembic upgrade head
```

### Données de démonstration

```bash
# Charger les données de seed (12 agences, ~50 biens, tous les rôles)
docker compose exec backend python seed.py
```

### Tests

```bash
# Tests backend (pytest)
docker compose exec backend pytest

# Tests frontend (Jest)
docker compose exec frontend npm test
```

## Structure du projet

```
ymmo/
├── backend/          # FastAPI + SQLAlchemy + Alembic
│   ├── app/
│   │   ├── main.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── routers/
│   │   ├── services/
│   │   ├── analytics/
│   │   └── core/
│   ├── alembic/
│   ├── tests/
│   ├── seed.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/         # Next.js 14 App Router
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

## Rôles utilisateurs

| Rôle | Accès |
|---|---|
| Visiteur | Consulter les annonces |
| Client | Favoris, offres, documents, messagerie |
| Agent | Gestion annonces, offres, analytics |
| Admin | Gestion complète de la plateforme |
