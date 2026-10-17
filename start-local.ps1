$ErrorActionPreference = 'Stop'
$projectRoot = $PSScriptRoot
$runtime = Join-Path $projectRoot '.local'
$nodeHome = Join-Path $runtime 'node-v22.22.0-win-x64'
$node = Join-Path $nodeHome 'node.exe'
$pgService = 'postgresql-x64-18'
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

if (!(Test-Path $node)) {
    throw 'Node.js local ausente em .local.'
}
$backendMain = Join-Path $backend 'dist\main.js'
if (!(Test-Path $backendMain)) { throw 'Compile o backend antes de iniciar (npm run build).' }

# PostgreSQL 18 instalado como servico do Windows (inicia com o sistema)
$service = Get-Service -Name $pgService -ErrorAction SilentlyContinue
if (!$service) { throw "Servico $pgService nao encontrado. Instale o PostgreSQL 18." }
if ($service.Status -ne 'Running') {
    try { Start-Service -Name $pgService } catch {
        throw "Servico $pgService parado. Inicie-o como administrador: Start-Service $pgService"
    }
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
