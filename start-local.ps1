$ErrorActionPreference = 'Stop'
$projectRoot = $PSScriptRoot
$runtime = Join-Path $projectRoot '.local'
$nodeHome = Join-Path $runtime 'node-v22.22.0-win-x64'
$node = Join-Path $nodeHome 'node.exe'
$pg = Join-Path $runtime 'pgsql\bin'
$data = Join-Path $runtime 'pgdata'
$backend = Join-Path (Split-Path $projectRoot -Parent) 'move2fit-backend'
$statePath = Join-Path $runtime 'processes.json'
$env:PATH = "$nodeHome;$env:PATH"
$env:DB_HOST = '127.0.0.1'
$env:DB_PORT = '5432'
$env:DB_USERNAME = 'movetofit'
$env:DB_PASSWORD = 'move2fit'
$env:DB_NAME = 'movetofit'
$env:PORT = '3000'
$env:VITE_API_URL = 'http://localhost:3000'
$env:APP_PORT = '5173'

if (!(Test-Path $node) -or !(Test-Path (Join-Path $pg 'pg_ctl.exe'))) {
    throw 'Node.js ou PostgreSQL local ausente em .local.'
}
$backendMain = Join-Path $backend 'dist\main.js'
if (!(Test-Path $backendMain)) { throw 'Compile o backend antes de iniciar (npm run build).' }

& (Join-Path $pg 'pg_ctl.exe') -D $data status *> $null
if ($LASTEXITCODE -ne 0) {
    & (Join-Path $pg 'pg_ctl.exe') -D $data -l (Join-Path $runtime 'postgres.log') -w start
    if ($LASTEXITCODE -ne 0) { throw 'Falha ao iniciar PostgreSQL. Consulte .local\postgres.log.' }
}

$tracked = @()
if (Test-Path $statePath) { $tracked = Get-Content $statePath -Raw | ConvertFrom-Json }
function Start-LocalService($name, $port, $entry, $workingDirectory, $arguments) {
    $existing = $tracked | Where-Object name -eq $name
    if ($existing) {
        $running = Get-Process -Id $existing.pid -ErrorAction SilentlyContinue
        if ($running -and $running.StartTime.ToUniversalTime().ToString('o') -eq $existing.started) {
            Write-Host "$name ja esta em execucao."
            return
        }
    }
    if (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue) {
        throw "Porta $port ocupada por outro processo."
    }
    $process = Start-Process -FilePath $node -ArgumentList (@('"' + $entry + '"') + $arguments) -WorkingDirectory $workingDirectory -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $runtime "$name.log") -RedirectStandardError (Join-Path $runtime "$name-error.log")
    $script:tracked = @($tracked | Where-Object name -ne $name) + @([pscustomobject]@{ name = $name; pid = $process.Id; started = $process.StartTime.ToUniversalTime().ToString('o') })
    ConvertTo-Json -InputObject @($script:tracked) | Set-Content $statePath
}
Start-LocalService 'backend' 3000 $backendMain $backend @()
Start-LocalService 'frontend' 5173 (Join-Path $projectRoot 'node_modules\vite\bin\vite.js') $projectRoot @('--host', '127.0.0.1')

foreach ($url in @('http://localhost:3000/swagger', 'http://127.0.0.1:5173')) {
    $ready = $false
    for ($attempt = 0; $attempt -lt 30; $attempt++) {
        try {
            $status = & curl.exe --noproxy '*' --silent --output NUL --write-out '%{http_code}' --max-time 2 $url
            if ($LASTEXITCODE -eq 0 -and $status -eq '200') { $ready = $true; break }
            Start-Sleep -Milliseconds 500
        } catch { Start-Sleep -Milliseconds 500 }
    }
    if (!$ready) { throw "Servico indisponivel: $url. Consulte os logs em .local." }
}
Write-Host 'Frontend: http://localhost:5173'
Write-Host 'API / Swagger: http://localhost:3000/swagger'
