#!/bin/sh
set -e

# Decode GCS service account key from base64 env into a file if provided
if [ -n "$GCS_KEY_B64" ]; then
  echo "Decoding GCS key from GCS_KEY_B64 into /usr/src/app/gcs-key.json"
  mkdir -p /usr/src/app
  echo "$GCS_KEY_B64" | base64 -d > /usr/src/app/gcs-key.json
  export GOOGLE_APPLICATION_CREDENTIALS=/usr/src/app/gcs-key.json
fi

# If a key file was mounted or created, ensure GOOGLE_APPLICATION_CREDENTIALS is set
if [ -z "$GOOGLE_APPLICATION_CREDENTIALS" ] && [ -f "/usr/src/app/gcs-key.json" ]; then
  export GOOGLE_APPLICATION_CREDENTIALS=/usr/src/app/gcs-key.json
fi

# Default NODE_ENV to production when not explicitly set
export NODE_ENV=${NODE_ENV:-production}
echo "Entry point starting. NODE_ENV=$NODE_ENV"

# Ensure Prisma Client is generated for this environment before running migrations
if [ -n "$DATABASE_URL" ]; then
  echo "Generating Prisma Client..."
  # Prefer pnpm if available (local devDependency), otherwise fall back to npx
  if command -v pnpm >/dev/null 2>&1; then
    pnpm exec prisma generate --schema=./prisma/schema.prisma || echo "Prisma generate encountered an error (continuing)"
  else
    npx prisma generate --schema=./prisma/schema.prisma || echo "Prisma generate encountered an error (continuing)"
  fi
fi

# Run Prisma migrations if possible (best-effort)
if [ -n "$DATABASE_URL" ]; then
  echo "Running prisma migrate deploy (if any)..."
  # Prefer pnpm exec to use the local version; fall back to npx
  if command -v pnpm >/dev/null 2>&1; then
    pnpm exec prisma migrate deploy || echo "Prisma migrate deploy exited with non-zero status"
  elif command -v npx >/dev/null 2>&1; then
    npx prisma migrate deploy || echo "Prisma migrate deploy exited with non-zero status"
  else
    echo "Neither pnpm nor npx available; skipping migrations"
  fi
fi

# Exec the container CMD
exec "$@"
