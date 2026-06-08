#!/bin/bash
# ============================================================
# Algo OJ - Database Restore Script
# ============================================================
# Restores the PostgreSQL database from a backup file.
# Usage: npm run db:restore -- <backup_file>
# ============================================================

set -euo pipefail

# Configuration
DB_NAME="${POSTGRES_DB:-algo_oj}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"

# Check arguments
if [ $# -eq 0 ]; then
    echo "Usage: $0 <backup_file>"
    echo ""
    echo "Available backups:"
    ls -lh ./backups/${DB_NAME}_*.sql.gz 2>/dev/null || echo "  No backups found"
    exit 1
fi

BACKUP_FILE="$1"

echo "=== Algo OJ Database Restore ==="
echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo "Backup file: $BACKUP_FILE"
echo ""

# Verify backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "ERROR: Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Verify backup integrity
echo "[1/3] Verifying backup integrity..."
if gzip -t "$BACKUP_FILE" 2>/dev/null; then
    echo "  Integrity check: PASSED"
else
    echo "  Integrity check: FAILED - backup file is corrupted"
    exit 1
fi

# Confirmation
echo ""
echo "WARNING: This will DROP and recreate the database '$DB_NAME'."
echo "All existing data will be permanently lost."
read -p "Are you sure? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

# Drop and recreate database
echo "[2/3] Recreating database..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS \"$DB_NAME\";"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "CREATE DATABASE \"$DB_NAME\" OWNER \"$DB_USER\";"
echo "  Database recreated"

# Restore from backup
echo "[3/3] Restoring data..."
gunzip -c "$BACKUP_FILE" | psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" --quiet

echo ""
echo "=== Restore complete ==="
echo "Run 'npm run db:health' to verify the restored database."
