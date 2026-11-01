#!/usr/bin/env bash
# Runs migrations + tests on a plain PostGIS Postgres (no Supabase needed).
# Usage: PGURL=postgres://postgres:postgres@localhost:5432/postgres ./run_db_tests.sh
set -euo pipefail
cd "$(dirname "$0")"
PSQL="psql ${PGURL:-} -q -v ON_ERROR_STOP=1"
$PSQL -c 'drop schema if exists public cascade; create schema public; drop schema if exists auth cascade;'
$PSQL -f tests/00_supabase_stubs.sql 2>&1 | grep -v NOTICE || true
for f in migrations/*.sql; do
  case "$f" in *_cron.sql|*_storage.sql) echo "skip (Supabase-only): $f"; continue;; esac
  $PSQL -f "$f" 2>&1 | grep -v NOTICE || true
done
$PSQL -f tests/10_schema_tests.sql
