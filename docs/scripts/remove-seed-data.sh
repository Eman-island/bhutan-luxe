#!/usr/bin/env bash
# ============================================================
# Bhutan-Luxe: Apply remove-seed-data.sql via the Supabase
# Management API.
#
# We use the Management API because Supabase free-tier direct DB
# connections are IPv6-only and the user's network is IPv4-only,
# so `supabase db push` and psql don't work here.
#
# Usage:
#   bash docs/scripts/remove-seed-data.sh
#
# Override the project ref if needed:
#   SUPABASE_PROJECT_REF=xxxxxxxx bash docs/scripts/remove-seed-data.sh
#
# Requires: jq, curl, macOS keychain entry from `supabase login`.
# ============================================================
set -euo pipefail

PROJECT_REF="${SUPABASE_PROJECT_REF:-rqoxbhabzecuuycxjtca}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_PATH="$SCRIPT_DIR/remove-seed-data.sql"

if [ ! -f "$SQL_PATH" ]; then
  echo "Error: SQL file not found at $SQL_PATH" >&2
  exit 1
fi

# Pull access token from macOS keychain (written by `supabase login`).
TOKEN_RAW=$(security find-generic-password -s "Supabase CLI" -a "supabase" -w 2>/dev/null || true)
if [ -z "$TOKEN_RAW" ]; then
  echo "Error: no Supabase CLI token in keychain. Run: supabase login" >&2
  exit 1
fi
TOKEN=$(printf '%s' "$TOKEN_RAW" | sed 's/go-keyring-base64://' | base64 -d)

SQL=$(cat "$SQL_PATH")
PAYLOAD=$(jq -n --arg q "$SQL" '{query:$q}')

echo "Applying $SQL_PATH to project $PROJECT_REF..."
RESPONSE=$(curl -sS -X POST "https://api.supabase.com/v1/projects/$PROJECT_REF/database/query" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
