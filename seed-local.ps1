$ErrorActionPreference = 'Stop'
$node = Join-Path $PSScriptRoot '.local\node-v22.22.0-win-x64\node.exe'
& $node (Join-Path $PSScriptRoot 'seed-local.cjs')
if ($LASTEXITCODE -ne 0) { throw 'Falha ao popular o banco. Nenhuma alteracao parcial foi aplicada.' }
