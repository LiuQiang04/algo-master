#!/bin/bash
# ============================================================
# AlgoArena Deployment Script
# ============================================================
# Usage:
#   ./deploy.sh docker         # Deploy with Docker Compose
#   ./deploy.sh k8s            # Deploy to Kubernetes
#   ./deploy.sh docker-prod    # Deploy with Docker Compose (production)
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

error() {
    log "ERROR: $*" >&2
    exit 1
}

# ==================== Pre-flight Checks ====================
preflight() {
    log "Running pre-flight checks..."

    # Check .env file
    if [ ! -f "$PROJECT_ROOT/.env" ]; then
        log "WARNING: .env file not found, copying from .env.example"
        cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/.env"
        log "Please edit .env with your production values before continuing"
        exit 1
    fi

    # Check JWT_SECRET
    source "$PROJECT_ROOT/.env"
    if [ "${JWT_SECRET:-}" = "generate-a-secure-random-string-at-least-32-chars" ] || [ ${#JWT_SECRET:-0} -lt 32 ]; then
        error "JWT_SECRET must be set to a secure random string (32+ chars)"
    fi

    log "Pre-flight checks passed"
}

# ==================== Docker Deploy ====================
deploy_docker() {
    local PROFILE="${1:-}"

    log "Deploying with Docker Compose..."

    cd "$PROJECT_ROOT"

    # Build images
    log "Building images..."
    docker compose build

    # Run migrations
    log "Running database migrations..."
    docker compose --profile migration run --rm db-migrate

    # Start services
    log "Starting services..."
    if [ "$PROFILE" = "prod" ]; then
        docker compose --profile production up -d
    else
        docker compose up -d
    fi

    # Wait for health checks
    log "Waiting for services to be healthy..."
    sleep 10

    # Check health
    docker compose ps
    log "Docker deployment complete!"
}

# ==================== Kubernetes Deploy ====================
deploy_k8s() {
    log "Deploying to Kubernetes..."

    cd "$PROJECT_ROOT"

    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        error "kubectl is not installed"
    fi

    # Apply manifests
    log "Applying Kubernetes manifests..."
    kubectl apply -f deploy/kubernetes/namespace.yaml
    kubectl apply -f deploy/kubernetes/configmap.yaml
    kubectl apply -f deploy/kubernetes/secrets.yaml
    kubectl apply -f deploy/kubernetes/postgres.yaml
    kubectl apply -f deploy/kubernetes/redis.yaml
    kubectl apply -f deploy/kubernetes/backend.yaml
    kubectl apply -f deploy/kubernetes/server.yaml
    kubectl apply -f deploy/kubernetes/frontend.yaml
    kubectl apply -f deploy/kubernetes/ingress.yaml

    # Apply security policies
    log "Applying security policies..."
    kubectl apply -f deploy/security/network-policy.yaml
    kubectl apply -f deploy/security/rbac.yaml

    # Wait for rollout
    log "Waiting for rollout..."
    kubectl rollout status deployment/backend -n algo-arena --timeout=300s
    kubectl rollout status deployment/server -n algo-arena --timeout=300s
    kubectl rollout status deployment/frontend -n algo-arena --timeout=300s

    # Show status
    log "Deployment status:"
    kubectl get pods -n algo-arena
    kubectl get svc -n algo-arena
    kubectl get ingress -n algo-arena

    log "Kubernetes deployment complete!"
}

# ==================== Main ====================
case "${1:-}" in
    docker)
        preflight
        deploy_docker
        ;;
    docker-prod)
        preflight
        deploy_docker prod
        ;;
    k8s)
        deploy_k8s
        ;;
    *)
        echo "Usage: $0 {docker|docker-prod|k8s}"
        echo ""
        echo "Commands:"
        echo "  docker       Deploy with Docker Compose (development)"
        echo "  docker-prod  Deploy with Docker Compose (production)"
        echo "  k8s          Deploy to Kubernetes"
        exit 1
        ;;
esac
