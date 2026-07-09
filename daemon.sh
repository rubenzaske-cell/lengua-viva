#!/bin/bash
# Daemon robusto que mantiene el servidor Next.js corriendo
# Se reinicia automáticamente si se cae

# Asegurar que el .env tenga la URL correcta de PostgreSQL
ENV_FILE="/home/z/my-project/.env"
CORRECT_URL="postgresql://neondb_owner:npg_Vp9DK2ZlBYdF@ep-polished-sun-ajksq5jh-pooler.c-3.us-east-2.aws.neon.tech/neondb?sslmode=require"

if ! grep -q "postgresql://" "$ENV_FILE" 2>/dev/null; then
  echo "DATABASE_URL=$CORRECT_URL" > "$ENV_FILE"
fi

export DATABASE_URL="$CORRECT_URL"
export NODE_OPTIONS="--max-old-space-size=1536"
cd /home/z/my-project

# Bucle infinito: si el servidor se cae, se reinicia
while true; do
  echo "[$(date '+%H:%M:%S')] Iniciando Next.js..."
  node node_modules/.bin/next dev -p 3000 > dev.log 2>&1
  EXIT_CODE=$?
  echo "[$(date '+%H:%M:%S')] Next.js terminó con código $EXIT_CODE. Reiniciando en 2s..."
  sleep 2
done
