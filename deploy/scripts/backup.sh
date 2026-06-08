#!/bin/bash
# ============================================================
# AlgoArena Database Backup Script
# ============================================================
# Usage:
#   ./backup.sh                    # Backup to local
#   ./backup.sh --upload-s3        # Backup and upload to S3
#   ./backup.sh --restore backup.sql.gz  # Restore from backup
# ============================================================

set -euo pipefail

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/var/backups/algo-arena}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="algo_arena_${TIMESTAMP}.sql.gz"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

# Database connection
PGHOST="${PGHOST:-postgres}"
PGPORT="${PGPORT:-5432}"
PGUSER="${PGUSER:-postgres}"
PGDATABASE="${PGDATABASE:-algo_arena}"

# S3 configuration (optional)
S3_BUCKET="${S3_BUCKET:-algo-arena-backups}"
S3_PREFIX="${S3_PREFIX:-database}"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

error() {
    log "ERROR: $*" >&2
    exit 1
}

# Create backup directory
mkdir -p "$BACKUP_DIR"

# ==================== Backup ====================
backup() {
    log "Starting database backup..."
    log "Host: $PGHOST, Database: $PGDATABASE"

    PGPASSWORD="${PGPASSWORD:-}" pg_dump \
        -h "$PGHOST" \
        -p "$PGPORT" \
        -U "$PGUSER" \
        -d "$PGDATABASE" \
        --format=custom \
        --compress=9 \
        --verbose \
        --file="${BACKUP_DIR}/${BACKUP_FILE}" 2>&1

    # Verify backup
    if [ ! -f "${BACKUP_DIR}/${BACKUP_FILE}" ]; then
        error "Backup file was not created"
    fi

    BACKUP_SIZE=$(du -h "${BACKUP_DIR}/${BACKUP_FILE}" | cut -f1)
    log "Backup completed: ${BACKUP_FILE} (${BACKUP_SIZE})"

    # Cleanup old backups
    log "Cleaning up backups older than ${RETENTION_DAYS} days..."
    find "$BACKUP_DIR" -name "algo_arena_*.sql.gz" -mtime +"$RETENTION_DAYS" -delete
    log "Cleanup completed"
}

# ==================== Upload to S3 ====================
upload_s3() {
    if ! command -v aws &> /dev/null; then
        error "AWS CLI is not installed"
    fi

    log "Uploading backup to S3: s3://${S3_BUCKET}/${S3_PREFIX}/${BACKUP_FILE}"
    aws s3 cp "${BACKUP_DIR}/${BACKUP_FILE}" "s3://${S3_BUCKET}/${S3_PREFIX}/${BACKUP_FILE}" \
        --storage-class STANDARD_IA

    log "S3 upload completed"

    # Apply S3 lifecycle policy (delete after 90 days)
    log "Note: Ensure S3 lifecycle policy is configured for automatic cleanup"
}

# ==================== Restore ====================
restore() {
    local RESTORE_FILE="$1"

    if [ ! -f "$RESTORE_FILE" ]; then
        error "Restore file not found: $RESTORE_FILE"
    fi

    log "WARNING: This will overwrite the current database!"
    log "Restoring from: $RESTORE_FILE"

    PGPASSWORD="${PGPASSWORD:-}" pg_restore \
        -h "$PGHOST" \
        -p "$PGPORT" \
        -U "$PGUSER" \
        -d "$PGDATABASE" \
        --clean \
        --if-exists \
        --verbose \
        "$RESTORE_FILE" 2>&1

    log "Restore completed successfully"
}

# ==================== Health Check ====================
health_check() {
    log "Running backup health check..."

    LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/algo_arena_*.sql.gz 2>/dev/null | head -1)

    if [ -z "$LATEST_BACKUP" ]; then
        error "No backup files found"
    fi

    BACKUP_AGE=$(( ($(date +%s) - $(stat -c %Y "$LATEST_BACKUP")) / 86400 ))

    if [ "$BACKUP_AGE" -gt "$RETENTION_DAYS" ]; then
        error "Latest backup is ${BACKUP_AGE} days old (threshold: ${RETENTION_DAYS})"
    fi

    log "Latest backup: $(basename "$LATEST_BACKUP") (${BACKUP_AGE} days old)"
    log "Health check passed"
}

# ==================== Main ====================
case "${1:-backup}" in
    backup)
        backup
        if [ "${2:-}" = "--upload-s3" ]; then
            upload_s3
        fi
        ;;
    --upload-s3)
        backup
        upload_s3
        ;;
    --restore)
        if [ -z "${2:-}" ]; then
            error "Please specify backup file: $0 --restore <file>"
        fi
        restore "$2"
        ;;
    --health)
        health_check
        ;;
    *)
        echo "Usage: $0 {backup|--upload-s3|--restore <file>|--health}"
        exit 1
        ;;
esac

log "Done."
