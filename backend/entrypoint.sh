#!/bin/sh
set -e

echo "Running database migrations..."
alembic upgrade head

# Seed demo data only on a fresh database (no agencies yet)
AGENCY_COUNT=$(python -c "
from app.core.database import SessionLocal
from sqlalchemy import text
db = SessionLocal()
result = db.execute(text('SELECT COUNT(*) FROM agencies')).scalar()
db.close()
print(result)
" 2>/dev/null || echo "0")

if [ "$AGENCY_COUNT" = "0" ]; then
  echo "Empty database detected — running seed..."
  python seed.py
fi

echo "Starting server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
