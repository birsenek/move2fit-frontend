$ErrorActionPreference = 'Stop'
$runtime = Join-Path $PSScriptRoot '.local'
$statePath = Join-Path $runtime 'processes.json'
if (Test-Path $statePath) {
    $tracked = Get-Content $statePath -Raw | ConvertFrom-Json
    foreach ($item in $tracked) {
        $process = Get-Process -Id $item.pid -ErrorAction SilentlyContinue
        if ($process -and $process.StartTime.ToUniversalTime().ToString('o') -eq $item.started) {
            Stop-Process -Id $process.Id
            Write-Host "$($item.name) parado."
        }
    }
    Remove-Item -LiteralPath $statePath
}
Write-Host 'Backend e frontend parados. O PostgreSQL continua rodando como servico do Windows.'
