#!/bin/bash
# Verificar si el servidor está corriendo, si no, reiniciarlo
if ! pgrep -f "next-server" > /dev/null 2>&1; then
  export DATABASE_URL="postgresql://neondb_owner:npg_Vp9DK2ZlBYdF@ep-polished-sun-ajksq5jh-pooler.c-3.us-east-2.aws.neon.tech/neondb?sslmode=require"
  export NODE_OPTIONS="--max-old-space-size=1536"
  cd /home/z/my-project
  # Asegurar .env
  if ! grep -q "postgresql://" .env 2>/dev/null; then
    echo "DATABASE_URL=$DATABASE_URL" > .env
  fi
  nohup node node_modules/.bin/next dev -p 3000 > dev.log 2>&1 &
  disown
fi
