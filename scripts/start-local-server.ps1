param(
    [int]$Port = 5500,
    [string]$RootPath = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($RootPath)) {
    $RootPath = Join-Path $PSScriptRoot ".."
}

$RootPath = [System.IO.Path]::GetFullPath($RootPath)
$prefix = "http://localhost:$Port/"
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add($prefix)

$syncScript = Join-Path $PSScriptRoot "sync-data.ps1"
if (Test-Path $syncScript) {
    try {
        Write-Host "[INFO] 启动前自动同步数据..." -ForegroundColor Yellow
        & $syncScript -ProjectRoot $RootPath -Quiet
        Write-Host "[OK] 自动同步完成" -ForegroundColor Green
    } catch {
        Write-Host "[ERROR] 自动同步失败：$($_.Exception.Message)" -ForegroundColor Red
        Read-Host "按回车退出"
        exit 1
    }
}

function Get-ContentType([string]$path) {
    switch ([System.IO.Path]::GetExtension($path).ToLowerInvariant()) {
        ".html" { return "text/html; charset=utf-8" }
        ".css" { return "text/css; charset=utf-8" }
        ".js" { return "application/javascript; charset=utf-8" }
        ".json" { return "application/json; charset=utf-8" }
        ".csv" { return "text/csv; charset=utf-8" }
        ".svg" { return "image/svg+xml" }
        ".png" { return "image/png" }
        ".jpg" { return "image/jpeg" }
        ".jpeg" { return "image/jpeg" }
        ".gif" { return "image/gif" }
        ".webp" { return "image/webp" }
        ".ico" { return "image/x-icon" }
        default { return "application/octet-stream" }
    }
}

function Write-TextResponse($response, [int]$statusCode, [string]$text) {
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($text)
    $response.StatusCode = $statusCode
    $response.ContentType = "text/plain; charset=utf-8"
    $response.ContentLength64 = $bytes.Length
    $response.OutputStream.Write($bytes, 0, $bytes.Length)
    $response.OutputStream.Close()
}

try {
    $listener.Start()
} catch {
    Write-Host "[ERROR] 本地服务启动失败：$($_.Exception.Message)" -ForegroundColor Red
    Write-Host "[TIP] 可能是端口 $Port 被占用，可改脚本参数为 -Port 5510 之类重试。" -ForegroundColor Yellow
    Read-Host "按回车退出"
    exit 1
}

Write-Host "[INFO] 本地静态服务已启动：$prefix" -ForegroundColor Cyan
Write-Host "[INFO] 根目录：$RootPath" -ForegroundColor Cyan
Write-Host "[INFO] 浏览器会自动打开首页，停止服务请按 Ctrl+C" -ForegroundColor Cyan
Start-Process "$prefix`index.html" | Out-Null

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
    } catch {
        break
    }

    $request = $context.Request
    $response = $context.Response
    $relativePath = [System.Uri]::UnescapeDataString($request.Url.AbsolutePath.TrimStart('/'))
    if ([string]::IsNullOrWhiteSpace($relativePath)) { $relativePath = "index.html" }

    $candidatePath = Join-Path $RootPath $relativePath
    $fullPath = [System.IO.Path]::GetFullPath($candidatePath)

    if (-not $fullPath.StartsWith($RootPath, [System.StringComparison]::OrdinalIgnoreCase)) {
        Write-TextResponse $response 403 "Forbidden"
        continue
    }

    if ((Test-Path $fullPath) -and (Get-Item $fullPath).PSIsContainer) {
        $fullPath = Join-Path $fullPath "index.html"
    }

    if (-not (Test-Path $fullPath)) {
        Write-TextResponse $response 404 "Not Found"
        continue
    }

    try {
        $bytes = [System.IO.File]::ReadAllBytes($fullPath)
        $response.StatusCode = 200
        $response.ContentType = Get-ContentType $fullPath
        $response.ContentLength64 = $bytes.Length
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
        $response.OutputStream.Close()
    } catch {
        Write-TextResponse $response 500 "Server Error"
    }
}
