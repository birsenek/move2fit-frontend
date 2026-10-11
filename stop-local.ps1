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
$pgCtl = Join-Path $runtime 'pgsql\bin\pg_ctl.exe'
$data = Join-Path $runtime 'pgdata'
& $pgCtl -D $data status *> $null
if ($LASTEXITCODE -eq 0) {
    & $pgCtl -D $data -m fast -w stop
    if ($LASTEXITCODE -ne 0) { throw 'Falha ao parar PostgreSQL.' }
}
Write-Host 'Servicos locais parados. Os dados do banco foram preservados.'
