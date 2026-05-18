"""
Seed script — clears all tables and inserts demo data.
Usage: docker compose exec backend python seed.py
"""

import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

import uuid
from datetime import datetime, timezone

from sqlalchemy import text

from app.core.database import SessionLocal, engine
from app.core.security import hash_password
from app.models import (  # noqa: F401 — ensure all models are imported so Base.metadata is complete
    Agency, User, Property, Photo, Favorite, Offer, Transaction, Document, Message, Notification,
)
from app.models.user import UserRole
from app.models.property import PropertyType, PropertyCategory, PropertyStatus
from app.models.offer import OfferStatus
from app.models.transaction import TransactionStatus

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def uid() -> str:
    return str(uuid.uuid4())


# ---------------------------------------------------------------------------
# Agency data (12 French cities)
# ---------------------------------------------------------------------------

AGENCIES = [
    {"name": "Ymmo Paris",          "city": "Paris",           "address": "12 rue de Rivoli, 75001 Paris"},
    {"name": "Ymmo Lyon",           "city": "Lyon",            "address": "5 place Bellecour, 69002 Lyon"},
    {"name": "Ymmo Marseille",      "city": "Marseille",       "address": "10 La Canebière, 13001 Marseille"},
    {"name": "Ymmo Bordeaux",       "city": "Bordeaux",        "address": "3 cours de l'Intendance, 33000 Bordeaux"},
    {"name": "Ymmo Lille",          "city": "Lille",           "address": "20 Grand'Place, 59000 Lille"},
    {"name": "Ymmo Toulouse",       "city": "Toulouse",        "address": "7 place du Capitole, 31000 Toulouse"},
    {"name": "Ymmo Nice",           "city": "Nice",            "address": "1 Promenade des Anglais, 06000 Nice"},
    {"name": "Ymmo Nantes",         "city": "Nantes",          "address": "2 place du Commerce, 44000 Nantes"},
    {"name": "Ymmo Strasbourg",     "city": "Strasbourg",      "address": "4 place Kléber, 67000 Strasbourg"},
    {"name": "Ymmo Rennes",         "city": "Rennes",          "address": "8 place de la République, 35000 Rennes"},
    {"name": "Ymmo Montpellier",    "city": "Montpellier",     "address": "6 place de la Comédie, 34000 Montpellier"},
    {"name": "Ymmo Aix-en-Provence","city": "Aix-en-Provence", "address": "15 cours Mirabeau, 13100 Aix-en-Provence"},
]

# city → (lat, lng)
CITY_COORDS = {
    "Paris":            (48.8566, 2.3522),
    "Lyon":             (45.7640, 4.8357),
    "Marseille":        (43.2965, 5.3698),
    "Bordeaux":         (44.8378, -0.5792),
    "Lille":            (50.6292, 3.0573),
    "Toulouse":         (43.6047, 1.4442),
    "Nice":             (43.7102, 7.2620),
    "Nantes":           (47.2184, -1.5536),
    "Strasbourg":       (48.5734, 7.7521),
    "Rennes":           (48.1173, -1.6778),
    "Montpellier":      (43.6108, 3.8767),
    "Aix-en-Provence":  (43.5297, 5.4474),
}

# ---------------------------------------------------------------------------
# Property templates (title, type, category, price, surface, rooms, DPE, description)
# ---------------------------------------------------------------------------

PROPERTY_TEMPLATES = [
    # Paris
    ("Appartement Haussmannien lumineux", PropertyType.apartment, PropertyCategory.residential, 650000, 85, 4, "B",
     "Bel appartement haussmannien au 3ème étage avec parquet, moulures et vue dégagée."),
    ("Studio Marais vue cour", PropertyType.studio, PropertyCategory.residential, 290000, 28, 1, "D",
     "Studio idéalement situé dans le Marais, exposé sud, cave incluse."),
    ("Loft République", PropertyType.apartment, PropertyCategory.residential, 820000, 120, 3, "C",
     "Magnifique loft industriel proche République, double hauteur sous plafond."),
    ("Bureau open-space République", PropertyType.office, PropertyCategory.professional, 540000, 200, 0, "C",
     "Plateau de bureaux modulable au cœur de Paris, accès PMR."),
    # Lyon
    ("Appartement T3 Presqu'île", PropertyType.apartment, PropertyCategory.residential, 380000, 72, 3, "C",
     "Appartement en plein cœur de la Presqu'île lyonnaise, balcon filant."),
    ("Maison Croix-Rousse", PropertyType.house, PropertyCategory.residential, 570000, 130, 5, "D",
     "Maison de ville typique de la Croix-Rousse sur 3 niveaux, jardin privatif."),
    ("Local commercial Part-Dieu", PropertyType.retail, PropertyCategory.professional, 310000, 95, 0, "E",
     "Local commercial en rez-de-chaussée, forte visibilité, proche gare Part-Dieu."),
    # Marseille
    ("Villa vue mer Malmousque", PropertyType.villa, PropertyCategory.residential, 1_250_000, 220, 6, "A",
     "Villa contemporaine avec piscine et vue panoramique sur la Méditerranée."),
    ("Appartement T2 Vieux-Port", PropertyType.apartment, PropertyCategory.residential, 210000, 45, 2, "E",
     "Charmant T2 à deux pas du Vieux-Port, idéal investissement locatif."),
    # Bordeaux
    ("Maison chartreuse Bordeaux", PropertyType.house, PropertyCategory.residential, 740000, 180, 6, "B",
     "Authentique maison chartreuse bordelaise avec cave à vins et jardin paysager."),
    ("Appartement T4 Chartrons", PropertyType.apartment, PropertyCategory.residential, 430000, 95, 4, "C",
     "Bel appartement dans le quartier des Chartrons, parquet massif, balcon."),
    # Lille
    ("Maison flamande rénovée", PropertyType.house, PropertyCategory.residential, 320000, 140, 5, "C",
     "Maison flamande entièrement rénovée, jardin, garage double."),
    ("Appartement T3 Vieux-Lille", PropertyType.apartment, PropertyCategory.residential, 270000, 68, 3, "D",
     "Appartement dans le cœur historique du Vieux-Lille, poutres apparentes."),
    # Toulouse
    ("Maison en briques roses", PropertyType.house, PropertyCategory.residential, 395000, 160, 5, "C",
     "Belle maison toulousaine en briques roses, piscine, terrain 800 m²."),
    ("Studio étudiant Capitole", PropertyType.studio, PropertyCategory.residential, 118000, 22, 1, "F",
     "Studio fonctionnel proche du Capitole, idéal investissement."),
    ("Entrepôt logistique Toulouse", PropertyType.warehouse, PropertyCategory.professional, 880000, 1200, 0, "D",
     "Entrepôt de 1200 m² avec quai de chargement, zone industrielle."),
    # Nice
    ("Villa provençale Cimiez", PropertyType.villa, PropertyCategory.residential, 1_800_000, 300, 7, "A",
     "Villa de prestige sur les hauteurs de Cimiez, vue mer, pool house."),
    ("Appartement Promenade des Anglais", PropertyType.apartment, PropertyCategory.residential, 560000, 75, 3, "C",
     "Appartement avec vue sur la mer depuis le salon, standing, gardien."),
    # Nantes
    ("Loft île de Nantes", PropertyType.apartment, PropertyCategory.residential, 350000, 100, 3, "B",
     "Loft atypique sur l'île de Nantes, terrasse, vue Loire."),
    ("Maison familiale Erdre", PropertyType.house, PropertyCategory.residential, 480000, 155, 5, "B",
     "Maison moderne au bord de l'Erdre, cuisine ouverte, jardin arboré."),
    # Strasbourg
    ("Appartement Petite France", PropertyType.apartment, PropertyCategory.residential, 290000, 60, 2, "D",
     "Appartement dans le quartier de la Petite France, vue canal, charme alsacien."),
    ("Maison à colombages rénovée", PropertyType.house, PropertyCategory.residential, 620000, 200, 6, "C",
     "Maison à colombages entièrement restaurée, jardin clos, cave voûtée."),
    ("Bureau centre Strasbourg", PropertyType.office, PropertyCategory.professional, 280000, 120, 0, "C",
     "Bureaux modernes en hypercentre, salles de réunion, parking."),
    # Rennes
    ("Appartement T4 Thabor", PropertyType.apartment, PropertyCategory.residential, 310000, 80, 4, "C",
     "Appartement lumineux proche du parc du Thabor, double vitrage."),
    ("Maison bretonne rénovée", PropertyType.house, PropertyCategory.residential, 390000, 145, 5, "B",
     "Maison bretonne entièrement rénovée avec matériaux nobles."),
    # Montpellier
    ("Villa T5 Port Marianne", PropertyType.villa, PropertyCategory.residential, 680000, 185, 5, "A",
     "Villa contemporaine dans le quartier Port Marianne, piscine, garage."),
    ("Appartement T2 Antigone", PropertyType.apartment, PropertyCategory.residential, 195000, 48, 2, "C",
     "Appartement T2 dans l'iconique quartier Antigone, loggia."),
    ("Espace coworking Montpellier", PropertyType.office, PropertyCategory.professional, 420000, 350, 0, "B",
     "Espace de coworking clé en main, 40 postes, salle de conférence."),
    # Aix-en-Provence
    ("Bastide aixoise", PropertyType.villa, PropertyCategory.residential, 2_100_000, 450, 8, "A",
     "Authentique bastide provençale sur 5 hectares, piscine, oliveraie."),
    ("Appartement cours Mirabeau", PropertyType.apartment, PropertyCategory.residential, 420000, 90, 3, "C",
     "Appartement bourgeois sur le cours Mirabeau, parquet point de Hongrie."),
    # Extra listings to reach ~50
    ("Studio étudiant Lyon", PropertyType.studio, PropertyCategory.residential, 120000, 20, 1, "G",
     "Studio proche de l'université, idéal investissement locatif."),
    ("Appartement T3 Marseille Nord", PropertyType.apartment, PropertyCategory.residential, 165000, 65, 3, "F",
     "Appartement rénové dans le 13ème arrondissement, calme résidentiel."),
    ("Maison plain-pied Bordeaux", PropertyType.house, PropertyCategory.residential, 365000, 110, 4, "B",
     "Maison de plain-pied avec jardin, cuisine équipée, proche commerces."),
    ("Villa Borély Marseille", PropertyType.villa, PropertyCategory.residential, 995000, 260, 6, "B",
     "Villa proche du parc Borély, belle luminosité, piscine chauffée."),
    ("Appartement T5 Paris 16e", PropertyType.apartment, PropertyCategory.residential, 1_450_000, 145, 5, "B",
     "Grand appartement familial dans le 16ème, double exposition, cave."),
    ("Entrepôt Nice aéroport", PropertyType.warehouse, PropertyCategory.professional, 720000, 850, 0, "E",
     "Entrepôt logistique proche de l'aéroport de Nice Côte d'Azur."),
    ("Studio Nantes hypercentre", PropertyType.studio, PropertyCategory.residential, 135000, 25, 1, "D",
     "Studio moderne au cœur de Nantes, idéal pied-à-terre."),
    ("Local commercial Strasbourg", PropertyType.retail, PropertyCategory.professional, 195000, 80, 0, "D",
     "Boutique en angle de rue, vitrine double, réserve."),
    ("Appartement T3 Rennes Sud", PropertyType.apartment, PropertyCategory.residential, 230000, 70, 3, "C",
     "Appartement bien orienté, cuisine équipée, parking en sous-sol."),
    ("Maison Toulouse banlieue", PropertyType.house, PropertyCategory.residential, 310000, 125, 4, "C",
     "Maison récente en lotissement, jardin, garage, école proche."),
    ("Appartement T2 Montpellier", PropertyType.apartment, PropertyCategory.residential, 175000, 42, 2, "D",
     "Appartement T2 en résidence sécurisée, piscine collective."),
    ("Villa Aix campagne", PropertyType.villa, PropertyCategory.residential, 1_100_000, 320, 7, "A",
     "Villa sur terrain de 2 hectares, piscine à débordement, vue dégagée."),
    ("Appartement T3 Lille métropole", PropertyType.apartment, PropertyCategory.residential, 255000, 78, 3, "C",
     "Appartement lumineux avec balcon, résidence récente, digicode."),
    ("Maison Nice collines", PropertyType.house, PropertyCategory.residential, 640000, 160, 5, "B",
     "Maison dans les collines niçoises, terrasse panoramique, garage."),
    ("Bureau Lyon Part-Dieu", PropertyType.office, PropertyCategory.professional, 480000, 180, 0, "B",
     "Plateaux de bureaux modernes en tour, accès direct métro."),
    ("Appartement T4 Bordeaux lac", PropertyType.apartment, PropertyCategory.residential, 345000, 88, 4, "C",
     "Appartement avec vue sur le lac, résidence gardée, cave, parking."),
    ("Maison Nantes Erdre Nord", PropertyType.house, PropertyCategory.residential, 410000, 140, 5, "B",
     "Maison familiale proche de l'Erdre, quartier calme, jardin arboré."),
    ("Loft Marseille Belle-de-Mai", PropertyType.apartment, PropertyCategory.residential, 280000, 95, 2, "D",
     "Loft atypique dans une ancienne manufacture, double hauteur, mezzanine."),
    ("Appartement T2 Strasbourg Krutenau", PropertyType.apartment, PropertyCategory.residential, 220000, 50, 2, "C",
     "Charmant T2 dans le quartier Krutenau, proche tramway, cour intérieure."),
    ("Maison Rennes banlieue", PropertyType.house, PropertyCategory.residential, 335000, 130, 5, "C",
     "Maison récente avec garage double, jardin clôturé, éco-quartier."),
]

# First 8 listings will be coup de cœur
COUP_DE_COEUR_INDICES = {0, 1, 4, 7, 9, 16, 27, 28}


def run_seed():
    db = SessionLocal()
    try:
        print("Clearing tables…")
        for tbl in [
            "notifications", "messages", "documents", "transactions",
            "offers", "favorites", "photos", "properties",
            "users", "agencies",
        ]:
            db.execute(text(f"DELETE FROM {tbl}"))
        db.commit()
        print("Tables cleared.")

        # ------------------------------------------------------------------ #
        # Agencies
        # ------------------------------------------------------------------ #
        print("Inserting agencies…")
        agency_objects = []
        for a in AGENCIES:
            obj = Agency(id=uid(), **a)
            db.add(obj)
            agency_objects.append(obj)
        db.commit()
        print(f"  {len(agency_objects)} agencies inserted.")

        # ------------------------------------------------------------------ #
        # Admin user
        # ------------------------------------------------------------------ #
        admin = User(
            id=uid(),
            name="Admin Ymmo",
            email="admin@ymmo.fr",
            password_hash=hash_password("Admin1234!"),
            role=UserRole.admin,
        )
        db.add(admin)

        # ------------------------------------------------------------------ #
        # Agents (1 per agency)
        # ------------------------------------------------------------------ #
        print("Inserting agents…")
        agent_objects = []
        for ag in agency_objects:
            slug = ag.city.lower().replace(" ", "").replace("-", "")
            agent = User(
                id=uid(),
                name=f"Agent {ag.city}",
                email=f"agent.{slug}@ymmo.fr",
                password_hash=hash_password("Agent1234!"),
                role=UserRole.agent,
                agency_id=ag.id,
            )
            db.add(agent)
            agent_objects.append(agent)
        db.commit()
        print(f"  {len(agent_objects)} agents inserted.")

        # ------------------------------------------------------------------ #
        # Clients
        # ------------------------------------------------------------------ #
        print("Inserting clients…")
        client_objects = []
        for i in range(1, 6):
            client = User(
                id=uid(),
                name=f"Client {i}",
                email=f"client{i}@example.fr",
                password_hash=hash_password("Client1234!"),
                role=UserRole.client,
            )
            db.add(client)
            client_objects.append(client)
        db.commit()
        print(f"  {len(client_objects)} clients inserted.")

        # ------------------------------------------------------------------ #
        # Properties (~50 listings)
        # ------------------------------------------------------------------ #
        print("Inserting properties…")
        prop_objects = []
        agency_cycle = [ag for ag in agency_objects for _ in range(5)]  # 12 × 5 ≥ 50 items

        for idx, tpl in enumerate(PROPERTY_TEMPLATES):
            title, ptype, cat, price, surface, rooms, dpe, desc = tpl
            agency = agency_cycle[idx % len(agency_cycle)]
            agent = next(
                (a for a in agent_objects if a.agency_id == agency.id),
                agent_objects[0],
            )
            city = agency.city
            base_lat, base_lng = CITY_COORDS.get(city, (46.8, 2.3))
            lat = base_lat + (idx % 7 - 3) * 0.005
            lng = base_lng + (idx % 5 - 2) * 0.005

            prop = Property(
                id=uid(),
                title=title,
                description=desc,
                price=price,
                surface=surface,
                rooms=rooms,
                type=ptype,
                category=cat,
                address=f"{10 + idx} {agency.address.split(',')[0]}, {city}",
                lat=lat,
                lng=lng,
                dpe_rating=dpe,
                coup_de_coeur=(idx in COUP_DE_COEUR_INDICES),
                status=PropertyStatus.published,
                floor=idx % 6 if ptype == PropertyType.apartment else None,
                parking=(idx % 3 == 0),
                cellar=(idx % 4 == 0),
                garden=(ptype in (PropertyType.house, PropertyType.villa)),
                agent_id=agent.id,
                agency_id=agency.id,
            )
            db.add(prop)
            prop_objects.append(prop)
        db.commit()
        print(f"  {len(prop_objects)} properties inserted.")

        # ------------------------------------------------------------------ #
        # Photos (2–4 per property using picsum)
        # ------------------------------------------------------------------ #
        print("Inserting photos…")
        photo_count = 0
        for i, prop in enumerate(prop_objects):
            n_photos = 2 + (i % 3)  # 2, 3, or 4
            for order in range(n_photos):
                seed_val = i * 10 + order
                photo = Photo(
                    id=uid(),
                    property_id=prop.id,
                    url=f"https://picsum.photos/seed/{seed_val}/800/600",
                    display_order=order,
                )
                db.add(photo)
                photo_count += 1
        db.commit()
        print(f"  {photo_count} photos inserted.")

        # ------------------------------------------------------------------ #
        # Offers (~10 rows in various statuses)
        # ------------------------------------------------------------------ #
        print("Inserting offers…")
        offer_data = [
            # (property_idx, client_idx, price, status)
            (0,  0, 620000,  OfferStatus.pending),
            (1,  1, 275000,  OfferStatus.countered),
            (4,  2, 360000,  OfferStatus.accepted),
            (5,  3, 540000,  OfferStatus.rejected),
            (7,  4, 1200000, OfferStatus.pending),
            (9,  0, 700000,  OfferStatus.accepted),
            (10, 1, 410000,  OfferStatus.pending),
            (14, 2, 112000,  OfferStatus.countered),
            (16, 3, 1700000, OfferStatus.pending),
            (19, 4, 460000,  OfferStatus.rejected),
        ]
        offer_objects = []
        for pidx, cidx, price, ostatus in offer_data:
            prop = prop_objects[pidx]
            client = client_objects[cidx]
            agent = next(a for a in agent_objects if a.agency_id == prop.agency_id)
            counter = price * 1.05 if ostatus == OfferStatus.countered else None
            offer = Offer(
                id=uid(),
                property_id=prop.id,
                client_id=client.id,
                agent_id=agent.id,
                proposed_price=price,
                counter_price=counter,
                status=ostatus,
            )
            db.add(offer)
            offer_objects.append(offer)
        db.commit()
        print(f"  {len(offer_objects)} offers inserted.")

        # ------------------------------------------------------------------ #
        # Transactions (2 in_progress — for the accepted offers)
        # ------------------------------------------------------------------ #
        print("Inserting transactions…")
        accepted_offers = [o for o in offer_objects if o.status == OfferStatus.accepted]
        transaction_objects = []
        for offer in accepted_offers[:2]:
            prop = db.get(Property, offer.property_id)
            txn = Transaction(
                id=uid(),
                property_id=offer.property_id,
                offer_id=offer.id,
                client_id=offer.client_id,
                agent_id=offer.agent_id,
                status=TransactionStatus.in_progress,
            )
            db.add(txn)
            transaction_objects.append(txn)
        db.commit()
        print(f"  {len(transaction_objects)} transactions inserted.")

        # ------------------------------------------------------------------ #
        # Messages (2 messages per active offer)
        # ------------------------------------------------------------------ #
        print("Inserting messages…")
        active_offers = [o for o in offer_objects if o.status in (OfferStatus.pending, OfferStatus.countered)]
        msg_count = 0
        for offer in active_offers:
            agent = next(a for a in agent_objects if a.id == offer.agent_id)
            client = db.get(User, offer.client_id)
            db.add(Message(
                id=uid(),
                offer_id=offer.id,
                sender_id=client.id,
                content="Bonjour, je suis intéressé par ce bien. Seriez-vous disponible pour une visite ?",
            ))
            db.add(Message(
                id=uid(),
                offer_id=offer.id,
                sender_id=agent.id,
                content="Bonjour, bien sûr ! Je vous propose ce samedi à 10h. Confirme ?",
            ))
            msg_count += 2
        db.commit()
        print(f"  {msg_count} messages inserted.")

        # ------------------------------------------------------------------ #
        # Notifications (one per offer for the agent, one for countered offers for client)
        # ------------------------------------------------------------------ #
        print("Inserting notifications…")
        notif_count = 0
        for offer in offer_objects:
            agent = db.get(User, offer.agent_id)
            db.add(Notification(
                id=uid(),
                user_id=agent.id,
                type="new_offer",
                payload={"offer_id": offer.id, "property_id": offer.property_id, "price": float(offer.proposed_price)},
                read=False,
            ))
            notif_count += 1

            if offer.status == OfferStatus.countered:
                db.add(Notification(
                    id=uid(),
                    user_id=offer.client_id,
                    type="offer_countered",
                    payload={"offer_id": offer.id, "counter_price": float(offer.counter_price or 0)},
                    read=False,
                ))
                notif_count += 1
        db.commit()
        print(f"  {notif_count} notifications inserted.")

        print("\nSeed completed successfully.")
        print("  Admin:   admin@ymmo.fr / Admin1234!")
        print("  Agents:  agent.<city>@ymmo.fr / Agent1234!")
        print("  Clients: client1-5@example.fr / Client1234!")

    except Exception as exc:
        db.rollback()
        print(f"Seed failed: {exc}", file=sys.stderr)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
