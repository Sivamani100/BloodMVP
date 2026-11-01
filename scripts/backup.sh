#!/usr/bin/env bash
# ==============================================================================
# Blood MVP | Database Backup Script
# Run weekly on staging / production:
# ./scripts/backup.sh
# ==============================================================================
set -euo pipefail

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="${BACKUP_DIR}/blood_backup_${TIMESTAMP}.sql"

mkdir -p "${BACKUP_DIR}"

if [ -z "${SUPABASE_DB_URL:-}" ]; then
  echo "Error: SUPABASE_DB_URL is not set in environment."
  echo "Find your connection string in Supabase Dashboard > Project Settings > Database."
  exit 1
fi

echo "Starting pg_dump..."
pg_dump "${SUPABASE_DB_URL}" \
  --schema=public \
  --schema=storage \
  --clean \
  --if-exists \
  --file="${FILENAME}"

echo "Backup completed successfully: ${FILENAME}"
echo "Recommendation: Encrypt this backup using gpg or age before storing offsite."
