param(
    [string]$ProjectRoot = "",
    [switch]$UseApi,
    [string]$Ak = "",
    [switch]$Quiet
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not [string]::IsNullOrWhiteSpace($ProjectRoot)) {
    $ProjectRoot = $ProjectRoot.Trim().TrimEnd([char[]]@('\', '/'))
}
if ([string]::IsNullOrWhiteSpace($ProjectRoot)) {
    $ProjectRoot = Join-Path $PSScriptRoot ".."
}

$ProjectRoot = [System.IO.Path]::GetFullPath($ProjectRoot)
$dateDir = Join-Path $ProjectRoot "date"
$configVolc = Join-Path $dateDir "volc-ark-apis.json"
if ([string]::IsNullOrWhiteSpace($Ak) -and (Test-Path -LiteralPath $configVolc)) {
    try {
        $v = Get-Content -LiteralPath $configVolc -Raw -Encoding UTF8 | ConvertFrom-Json
        if ($v.baiduMapAk) {
            $Ak = [string]$v.baiduMapAk.Trim()
        } elseif ($v.baidu_map_ak) {
            $Ak = [string]$v.baidu_map_ak.Trim()
        }
    } catch {
        # keep Ak empty
    }
}
$merchantsCsv = Join-Path $dateDir "merchants.csv"
$outputJson = Join-Path $dateDir "city-coords.json"

if (-not (Test-Path $merchantsCsv)) {
    throw "CSV not found: $merchantsCsv"
}

$rows = @(Import-Csv -Path $merchantsCsv -Encoding UTF8)
$grouped = @{}
foreach ($r in $rows) {
    $city = [string]$r.city
    $country = [string]$r.country
    if ([string]::IsNullOrWhiteSpace($city) -or [string]::IsNullOrWhiteSpace($country)) { continue }
    $key = "$city|$country"
    if (-not $grouped.ContainsKey($key)) {
        $grouped[$key] = [ordered]@{
            city = $city.Trim()
            country = $country.Trim()
            lat = [double]$r.lat
            lng = [double]$r.lng
            source = "csv"
        }
    }
}

if ($UseApi -and -not [string]::IsNullOrWhiteSpace($Ak)) {
    foreach ($key in $grouped.Keys) {
        $item = $grouped[$key]
        try {
            $address = [System.Web.HttpUtility]::UrlEncode([string]$item.city)
            $cityParam = [System.Web.HttpUtility]::UrlEncode([string]$item.country)
            $url = "https://api.map.baidu.com/geocoding/v3/?address=$address&city=$cityParam&output=json&ak=$Ak"
            $resp = Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 10
            if ($resp.status -eq 0 -and $resp.result -and $resp.result.location) {
                $item.lat = [double]$resp.result.location.lat
                $item.lng = [double]$resp.result.location.lng
                $item.source = "baidu-geocoding"
            }
        } catch {
            # Keep csv fallback
        }
    }
}

$cityList = @($grouped.Values | Sort-Object country, city)
$payload = [ordered]@{
    generatedAt = (Get-Date).ToUniversalTime().ToString("o")
    source = if ($UseApi) { "merchants.csv + baidu geocoding" } else { "merchants.csv" }
    cities = $cityList
}

$json = ConvertTo-Json -InputObject $payload -Depth 6
Set-Content -Path $outputJson -Value $json -Encoding UTF8

if (-not $Quiet) {
    Write-Host "[OK] Updated:" -ForegroundColor Green
    Write-Host " - date/city-coords.json" -ForegroundColor Cyan
}
