# Execucao local no Windows

Node.js esta instalado em `.local`, sem instalacao global ou Docker. O PostgreSQL 18 esta instalado globalmente como servico do Windows (`postgresql-x64-18`), que inicia junto com o sistema. O backend deve permanecer na pasta vizinha `../move2fit-backend`.

Na pasta do frontend, execute no PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File .\start-local.ps1
```

- Aplicacao: http://localhost:5173
- API e Swagger: http://localhost:3000/swagger

Crie sua conta na tela de cadastro da aplicacao.

## Dados de exemplo

Com o banco iniciado, execute:

```powershell
powershell -ExecutionPolicy Bypass -File .\seed-local.ps1
```

O comando adapta `../move2fit-backend/sql/seed.sql` ao modelo atual: 10 categorias, 10 exercicios, 2 treinadores (Carlos Oliveira e Ana Lima), 18 alunos e 23 vinculos entre alunos e exercicios. Os alunos ficam em `tb_usuarios` com `tipo = ALUNO`. Os outros oito treinadores do arquivo original sao convertidos em alunos, preservando seus dados e senhas. Pode executar novamente sem duplicar os dados do seed. Cadastros fora do seed nao sao alterados. A importacao usa uma transacao.

Login de treinador: `carlos.oliveira@email.com`, senha `Senha@123`. Todas as novas contas de exemplo usam essa senha. As cargas e repeticoes sao dados ficticios para testar o aplicativo.

Os perfis de exemplo usam avatares locais com as iniciais de cada pessoa em `public/images/avatars-seed`, substituindo os retratos aleatorios do seed original. Fotos personalizadas pelo usuario sao preservadas ao reexecutar o seed.

## Alunos por treinador

A tabela `tb_treinador_aluno` permite varios treinadores para o mesmo aluno. O seed distribui inicialmente nove alunos para Carlos e nove para Ana (`ana.lima@email.com`, senha `Senha@123`), sem substituir vinculos adicionados manualmente.

Cada treinador ve e edita somente os alunos vinculados a ele. Em **Cadastrar ou vincular aluno**, busque por nome ou email e selecione um resultado para adicionar apenas o vinculo. A busca exibe somente nome e email; dados do perfil e exercicios exigem o vinculo. Para um novo aluno, preencha o formulario: o treinador autenticado e associado automaticamente. O email identifica o cadastro, sem diferenciar maiusculas e minusculas. Nomes iguais com emails diferentes representam cadastros distintos.

Remover um aluno da lista remove somente o vinculo com o treinador atual. O cadastro, os exercicios e os demais treinadores permanecem. Perfil e exercicios do mesmo aluno sao compartilhados entre seus treinadores vinculados; ainda nao existem fichas de treino separadas por treinador.

A API valida os vinculos em listagem, consulta por ID, edicao, remocao e associacao de exercicios. Contas de aluno nao podem administrar essas rotas. O catalogo de exercicios permanece compartilhado e nao retorna listas de alunos.

Para verificar os fluxos e as permissoes com a API iniciada:

```powershell
& .\.local\node-v22.22.0-win-x64\node.exe --test tests\trainer-students.integration.cjs
```

Os testes criam e removem somente contas temporarias. Uma copia anterior a inclusao do relacionamento esta em `.local/backups/before-trainer-links.dump`.

Para parar o backend e o frontend (o PostgreSQL continua rodando como servico):

```powershell
powershell -ExecutionPolicy Bypass -File .\stop-local.ps1
```

## Banco de desenvolvimento

- Host: `127.0.0.1`
- Porta: `5432`
- Banco e usuario: `movetofit`
- Senha local: `move2fit`

O banco fica no PostgreSQL 18 global (`C:\Program Files\PostgreSQL\18`), servico `postgresql-x64-18`. O `start-local.ps1` apenas confere se o servico esta rodando. Para acessar pelo terminal: `psql -h 127.0.0.1 -U movetofit -d movetofit`.

Os dados foram migrados do antigo PostgreSQL 17 portatil. A pasta `.local/pgdata` e o dump `.local/backups/migracao-pg17-para-pg18.dump` ficam apenas como backup e nao sao mais usados. O backend cria e sincroniza as tabelas automaticamente. Estas credenciais sao apenas para desenvolvimento local.

O script transmite as variaveis `DB_*` para o backend e inicia a versao compilada. Depois de alterar o codigo do backend, pare os servicos, compile novamente e inicie:

```powershell
$env:PATH = "$PWD\.local\node-v22.22.0-win-x64;$env:PATH"
Push-Location ..\move2fit-backend
npm.cmd run build
Pop-Location
powershell -ExecutionPolicy Bypass -File .\start-local.ps1
```

O frontend usa Vite com atualizacao automatica. A URL da API esta configurada no `.env` local. Logs de cada servico ficam em `.local/*.log`.

Para reinstalar dependencias com o Node local no PATH:

```powershell
npm.cmd ci --legacy-peer-deps  # frontend: conflito de peer dependencies no projeto original
Push-Location ..\move2fit-backend
npm.cmd ci
Pop-Location
```

O Docker Compose original do backend usa MySQL, mas o codigo usa PostgreSQL. A configuracao local acima executa o PostgreSQL e nao depende desse Compose.

O histórico de avaliações, a migração das medidas e o modelo de machine learning estão descritos em [AVALIACOES_ML.md](AVALIACOES_ML.md). Para popular ou completar os dados locais, execute `powershell -ExecutionPolicy Bypass -File .\seed-local.ps1`.

Downloads utilizados: [Node.js](https://nodejs.org/en/download/archive/v22.22.0). PostgreSQL 18 instalado com `winget install PostgreSQL.PostgreSQL.18`.
