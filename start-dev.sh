#!/bin/bash
export DATABASE_URL="postgresql://neondb_owner:npg_Vp9DK2ZlBYdF@ep-polished-sun-ajksq5jh-pooler.c-3.us-east-2.aws.neon.tech/neondb?sslmode=require"
export NODE_OPTIONS="--max-old-space-size=2048"
cd /home/z/my-project
exec node node_modules/.bin/next dev -p 3000
