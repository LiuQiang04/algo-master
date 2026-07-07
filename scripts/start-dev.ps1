# AlgoMaster 开发环境启动脚本
# 用法: pwsh scripts/start-dev.ps1

param(
    [switch]$NoBrowser
)

function Write-Status {
    param([string]$Message, [string]$Color = "White")
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $Message" -ForegroundColor $Color
}

function Kill-ProcessOnPort {
    param([int]$Port)
    $connections = netstat -ano | Select-String ":$Port\s"
    foreach ($conn in $connections) {
        $line = $conn.Line
        $parts = ($line -split '\s+') | Where-Object { $_ -ne '' }
        $procId = $parts[-1]
        if ($procId -match '^\d+$') {
            $process = Get-Process -Id $procId -ErrorAction SilentlyContinue
            if ($process -and $process.Name -ne "System") {
                Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
                Write-Status "  → 已关闭端口 $Port (PID: $procId)" Yellow
            }
        }
    }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AlgoMaster 开发环境启动" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. 检查 PostgreSQL
$pgRunning = Get-Process -Name "postgres" -ErrorAction SilentlyContinue
if ($pgRunning) {
    Write-Status "PostgreSQL 已在运行" Green
} else {
    Write-Status "PostgreSQL 未运行！请启动 PostgreSQL 服务后重试" Red
    exit 1
}

# 2. 启动 Redis（如果不在运行）
$redisPort = netstat -ano | Select-String ":6379\s" | Select-String "LISTENING"
if (-not $redisPort) {
    Write-Status "启动 Redis..." Yellow
    # 先确保 Docker Desktop 在运行
    $dockerRunning = $true
    try { docker ps 2>&1 | Out-Null } catch { $dockerRunning = $false }
    if (-not $dockerRunning) {
        Write-Status "启动 Docker Desktop..." Yellow
        Start-Process -FilePath "D:\smallapps\Docker\Docker Desktop.exe"
        Start-Sleep -Seconds 15
    }
    # 启动 Redis 容器
    docker start algo-redis 2>$null
    if (-not $?) { docker run -d --name algo-redis -p 6379:6379 redis:7-alpine 2>$null }
    if ($?) {
        Start-Sleep -Seconds 3
        Write-Status "Redis 已启动" Green
    } else {
        Write-Status "Redis 启动失败（不影响核心功能）" Yellow
    }
} else {
    Write-Status "Redis 已在运行" Green
}

# 3. 杀掉端口上的旧进程（关键：基于端口杀，而不是猜进程名）
Write-Status "清理端口冲突..." Yellow
Kill-ProcessOnPort -Port 3001   # Server
Kill-ProcessOnPort -Port 5173   # Frontend 主端口
Kill-ProcessOnPort -Port 5174   # Vite 备用端口
Kill-ProcessOnPort -Port 5175   # Vite 备用端口
Start-Sleep -Seconds 1

# 4. 启动 Server
Write-Status "启动 Server (端口 3001)..." Yellow
Start-Process -NoNewWindow -FilePath "cmd.exe" -ArgumentList "/c cd /d D:\Files\school\project\20260607\server && npm run dev"
Start-Sleep -Seconds 5

# 检查 Server 是否成功启动
$serverRunning = netstat -ano | Select-String ":3001\s" | Select-String "LISTENING"
if ($serverRunning) {
    Write-Status "Server 启动成功 (端口 3001)" Green
} else {
    Write-Status "Server 启动中..." Yellow
}

# 5. 启动 Frontend
Write-Status "启动 Frontend (端口 5173)..." Yellow
Start-Process -NoNewWindow -FilePath "cmd.exe" -ArgumentList "/c cd /d D:\Files\school\project\20260607\frontend && npm run dev"
Start-Sleep -Seconds 5

# 检查 Frontend 是否成功启动
$frontendPorts = @(5173, 5174, 5175)
$frontendRunning = $false
foreach ($port in $frontendPorts) {
    $check = netstat -ano | Select-String ":$port\s" | Select-String "LISTENING"
    if ($check) {
        Write-Status "Frontend 启动成功 (端口 $port)" Green
        $frontendRunning = $true
        break
    }
}
if (-not $frontendRunning) {
    Write-Status "Frontend 启动中（稍后检查控制台）" Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  开发环境启动完成！" -ForegroundColor Green
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host "  Server:   http://localhost:3001" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "关闭方法: pwsh scripts\stop-dev.ps1" -ForegroundColor Yellow
