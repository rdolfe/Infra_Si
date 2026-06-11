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
| Déploiement | Windows Server (Bare-Metal) / PM2 |

## Démarrage rapide (Développement Local & Windows Server)

### Prérequis

- **Python 3.12+** (avec pip)
- **Node.js 20+** (avec npm)
- **PostgreSQL 16+** installé et configuré (avec PostGIS)
- Git

### Installation

**1. Cloner le dépôt**
```powershell
git clone <url-du-repo>
cd ymmo
```

**2. Base de données & Environnement**
```powershell
# Créer une base de données sur votre serveur PostgreSQL
# Copier le fichier d'environnement
cp .env.example .env
# Éditer .env avec votre chaîne de connexion (DATABASE_URL=postgresql://user:pass@localhost:5432/ymmo)
```

**3. Backend (FastAPI)**
Ouvrir un terminal (PowerShell/CMD) :
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Appliquer les migrations
alembic upgrade head

# (Optionnel) Charger les données de démonstration
python seed.py

# Démarrer le serveur
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**4. Frontend (Next.js)**
Ouvrir un nouveau terminal :
```powershell
cd frontend
npm install

# Démarrer le serveur de développement
npm run dev
```

Les services sont disponibles sur :
- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:8000
- **Docs API (Swagger)** : http://localhost:8000/docs

### Déploiement sur Windows Server (Production)

Pour héberger l'application sur un serveur Windows sans Docker, nous recommandons **PM2** (via Node.js) pour gérer les processus en arrière-plan et s'assurer qu'ils redémarrent en cas de redémarrage de la VM.

```powershell
# 1. Installer PM2 globalement
npm install -g pm2

# 2. Démarrer le Backend avec PM2
cd backend
pm2 start .\venv\Scripts\uvicorn.exe --name "ymmo-backend" -- app.main:app --host 0.0.0.0 --port 8000

# 3. Compiler et démarrer le Frontend avec PM2
cd ../frontend
npm run build
pm2 start npm --name "ymmo-frontend" -- run start

# 4. Sauvegarder la configuration PM2 pour relancer au démarrage du serveur (utilisez pm2-installer pour Windows)
pm2 save
```

### Tests

```powershell
# Tests backend (depuis le dossier backend avec venv activé)
pytest

# Tests frontend (depuis le dossier frontend)
npm test
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
│   └── requirements.txt
├── frontend/         # Next.js 14 App Router
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── package.json
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
