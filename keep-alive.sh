#!/bin/bash
# Mantener el servidor de desarrollo corriendo
export DATABASE_URL="postgresql://neondb_owner:npg_Vp9DK2ZlBYdF@ep-polished-sun-ajksq5jh-pooler.c-3.us-east-2.aws.neon.tech/neondb?sslmode=require"
export NODE_OPTIONS="--max-old-space-size=1536"
cd /home/z/my-project

while true; do
  echo "[$(date)] Iniciando servidor..."
  node node_modules/.bin/next dev -p 3000 2>&1 | tee dev.log
  echo "[$(date)] Servidor terminó. Reiniciando en 3s..."
  sleep 3
done
