# Setup test database for algo-arena (Windows/PowerShell)
# Run this script to create and configure the test database

$ErrorActionPreference = "Stop"

Write-Host "Setting up test database..." -ForegroundColor Cyan

# Create test database if it doesn't exist
$env:PGPASSWORD = "postgres"
$dbExists = psql -h localhost -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname = 'algo_arena_test'" 2>$null

if ($dbExists -ne "1") {
    psql -h localhost -U postgres -c "CREATE DATABASE algo_arena_test"
    Write-Host "Test database 'algo_arena_test' created." -ForegroundColor Green
} else {
    Write-Host "Test database 'algo_arena_test' already exists." -ForegroundColor Yellow
}

# Run Prisma migrations on test database
Push-Location "$PSScriptRoot\.."
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/algo_arena_test?schema=public"
npx prisma db push --force-reset

Write-Host "Test database schema pushed." -ForegroundColor Green

# Seed test data
npx tsx scripts/seed-test-db.ts

Write-Host "Test database seeded." -ForegroundColor Green
Write-Host "Setup complete!" -ForegroundColor Cyan

Pop-Location
