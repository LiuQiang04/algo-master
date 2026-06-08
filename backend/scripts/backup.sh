#!/bin/bash
# ============================================================
# Algo OJ - Database Backup Script
# ============================================================
# Creates a compressed backup of the PostgreSQL database.
# Usage: npm run db:backup
# ============================================================

set -euo pipefail

# Configuration
DB_NAME="${POSTGRES_DB:-algo_oj}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Generate timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql.gz"

echo "=== Algo OJ Database Backup ==="
echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo "Backup file: $BACKUP_FILE"
echo ""

# Create backup
echo "[1/3] Creating backup..."
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    --format=plain \
    --no-owner \
    --no-privileges \
    --verbose 2>/dev/null | gzip > "$BACKUP_FILE"

BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "  Backup created: $BACKUP_SIZE"

# Verify backup
echo "[2/3] Verifying backup..."
if gzip -t "$BACKUP_FILE" 2>/dev/null; then
    echo "  Backup verification: PASSED"
else
    echo "  Backup verification: FAILED"
    exit 1
fi

# Clean old backups
echo "[3/3] Cleaning backups older than $RETENTION_DAYS days..."
DELETED_COUNT=$(find "$BACKUP_DIR" -name "${DB_NAME}_*.sql.gz" -mtime +$RETENTION_DAYS -delete -print | wc -l)
echo "  Deleted $DELETED_COUNT old backup(s)"

# List current backups
echo ""
echo "Current backups:"
ls -lh "$BACKUP_DIR"/${DB_NAME}_*.sql.gz 2>/dev/null || echo "  No backups found"

echo ""
echo "=== Backup complete ==="
