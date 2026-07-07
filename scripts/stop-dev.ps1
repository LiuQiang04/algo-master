# AlgoMaster 开发环境关闭脚本
# 用法: pwsh scripts/stop-dev.ps1

function Write-Status {
    param([string]$Message, [string]$Color = "White")
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $Message" -ForegroundColor $Color
}

function Kill-ProcessOnPort {
    param([int]$Port)
    $connections = netstat -ano | Select-String ":$Port\s"
    if (-not $connections) {
        Write-Status "  → 端口 $Port 无进程" Gray
        return
    }
    foreach ($conn in $connections) {
        $line = $conn.Line
        $parts = ($line -split '\s+') | Where-Object { $_ -ne '' }
        $procId = $parts[-1]
        if ($procId -match '^\d+$') {
            $process = Get-Process -Id $procId -ErrorAction SilentlyContinue
            if ($process -and $process.Name -ne "System") {
                Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
                Write-Status "  → 已关闭端口 $Port (PID: $procId)" Green
            }
        }
    }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AlgoMaster 开发环境关闭" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Kill-ProcessOnPort -Port 3001
Kill-ProcessOnPort -Port 5173
Kill-ProcessOnPort -Port 5174
Kill-ProcessOnPort -Port 5175

Write-Host ""
Write-Host "  PostgreSQL 和 Redis 保留运行" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Green
Write-Host "  已关闭完毕" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
