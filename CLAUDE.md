# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn dev        # start dev server (default port 5173)
yarn build      # type-check + build for production
yarn lint       # ESLint
yarn format     # Prettier (src/**/*.ts and src/**/*.tsx)
yarn preview    # preview production build locally
```

If `yarn` is not available, use `npx` equivalents:
```bash
npx vite              # start dev server
npx tsc -b && npx vite build   # build
npx eslint .          # lint
```

**Docker:**
```bash
docker compose up   # run via Docker (copy .env.example to .env first)
```

### Local full stack (Windows, no Docker)

This repo also holds the scripts that run the whole project locally. Node.js 22 and PostgreSQL are portable installs under `.local/` (git-ignored), and the backend must sit in the sibling folder `../move2fit-backend`. Details in `LOCAL_SETUP.md`.

```powershell
powershell -ExecutionPolicy Bypass -File .\start-local.ps1   # PostgreSQL + backend (dist/main.js) + Vite
powershell -ExecutionPolicy Bypass -File .\seed-local.ps1    # sample data (idempotent)
powershell -ExecutionPolicy Bypass -File .\stop-local.ps1    # stop all three, keeping the data
```

- App: http://localhost:5173 — API/Swagger: http://localhost:3000/swagger
- `start-local.ps1` runs the **compiled** backend. After changing backend code: stop, run `npm.cmd run build` in `../move2fit-backend`, start again.
- Logs: `.local/*.log`. Database files: `.local/pgdata` (do not delete). Backups: `.local/backups/`.
- Dev database: `127.0.0.1:5432`, database and user `movetofit`, password `move2fit`.
- Seed trainer login: `carlos.oliveira@email.com` / `Senha@123` (also `ana.lima@email.com`). The seed creates 2 trainers, 18 students (9 each) and 10 weekly assessments per student, flagged `SEED`.
- Dependencies were installed with `npm.cmd ci --legacy-peer-deps` (peer dependency conflict in the original project).

### Tests

There is no frontend test runner. `tests/` contains `node:test` suites that exercise the **backend**:

```powershell
& '.\.local\node-v22.22.0-win-x64\node.exe' --test tests\tendencia.test.cjs tests\trainer-students.integration.cjs
```

- `tendencia.test.cjs` — unit tests for the regression model; requires the built backend (`../move2fit-backend/dist/avaliacoes/tendencia`).
- `trainer-students.integration.cjs` — needs the API and database running (`TEST_API_URL`, `DB_*` env vars, defaults match the local setup). Covers trainer isolation, autocomplete, linking, shared students, assessments, weekly duplicates and concurrent signups. It creates and removes only temporary accounts.

## Environment

Copy `.env.example` to `.env` and set `VITE_API_URL` to the backend base URL before running (`http://localhost:3000` locally).

## Architecture

**Stack:** React 19, TypeScript, Vite, Tailwind CSS 4 (loaded via `@tailwindcss/vite` plugin, not PostCSS), React Router v7, Axios, React Toastify. No charting library — the assessment charts are hand-written SVG.

**Auth flow:** `AuthContext` (`src/contexts/AuthContext.tsx`) holds a `UsuarioLogin` state with the JWT `token` (already prefixed with `Bearer `) and the account `tipo` (`'PERSONAL_TRAINER'` | `'ALUNO'`). Login posts to `/usuarios/logar`. Every authenticated API call passes `{ headers: { Authorization: token } }`. Auth state is in-memory only — it resets on page refresh. `UsuarioLogin` still declares `peso`/`altura`/`imc`/`classificacao`, but the login response no longer sends them; do not read measurements from the logged-in user.

**Service layer:** `src/services/Service.ts` exports the Axios instance `api` (`baseURL` = `VITE_API_URL`) and thin wrappers (`buscar`, `cadastrar`, `atualizar`, `deletar`, `login`, `cadastrarUsuario`). The wrappers push the response into a setter; newer code calls `api.get/post` directly when it needs the response, query params, an `AbortController` signal, or a POST with no meaningful body. There is no state management library.

**Domain models** (`src/models/`):
- `Categoria` — exercise category (id, nome, descricao, icone)
- `Exercicio` — catalog exercise with carga, repeticao, tempo; belongs to one `Categoria`
- `Aluno` — student as returned by `/alunos`: id, nome, usuario (email), foto, `exercicio` (the API's field name; `exercicios` is kept as a fallback), `ultimaAvaliacao`, and `peso`/`altura`/`imc`/`classificacao`. Those four are a **read-only summary of the latest assessment** and may be `null`
- `Avaliacao` — one weekly assessment: dataColeta, semanaInicio, peso, altura, imc, classificacao, `origem` (`'MANUAL'` | `'SEED'` | `'MIGRACAO'`)
- `Usuario` / `UsuarioLogin` — authentication user (login response includes the JWT token)

**Component pattern:** `categorias` and `exercicios` follow the same structure under `src/components/<entity>/`:
- `Lista<Entity>` — fetches and lists all records
- `Form<Entity>` — handles both create (`/store`) and edit (`/edit/:id`) via a single component
- `Deletar<Entity>` — confirmation + deletion
- `Card<Entity>` — display card used inside the list

`src/components/aluno/` has the same four pieces, but with trainer-specific behavior:
- `ListaAluno` — only the students linked to the logged-in trainer; filters by name or email.
- `FormAluno` + `formaluno/BuscaAluno` — "Cadastrar ou vincular aluno". `BuscaAluno` is a debounced, keyboard-accessible combobox over `GET /alunos/buscar?q=`; picking a result links the existing student (`POST /alunos/:id/vincular`) instead of creating one. Filling the form creates a new student (`POST /alunos`), whose peso/altura become the first assessment. Editing sends only `{ id, nome, foto }`.
- `DeletarAluno` — removes the trainer↔student **link**, not the account.
- `AssociarExercicio` — assigns exercises with `POST /alunos/:id/exercicios/:exercicioId`.
- `AvaliacoesAluno` — assessment history section rendered inside `PerfilAluno`: SVG charts for weight and IMC, the linear-regression trend block (coefficient, next-week estimate, MAE vs. baseline), the history table, and a `<dialog>` to register a weekly assessment.

`ListaAluno` and `FormAluno` render a "treinadores only" message when `usuario.tipo !== 'PERSONAL_TRAINER'`; the backend enforces the same rule.

**Routes** (defined in `App.tsx`):
- `/` → `HomePage` (public landing); `/sobre`, `/equipe`
- `/login`, `/cadastro` → `LoginCadastroForm`
- `/home` → authenticated home dashboard; `/perfil` → logged-in user profile (no measurements anymore)
- `/categorias`, `/exercicios`, `/alunos` → list views
- `/<resource>/store`, `/<resource>/edit/:id` → create / edit
- Delete routes: `/categorias/detroy/:id` and `/exercicios/detroy/:id` (typo kept on purpose), but `/alunos/destroy/:id`
- `/alunos/perfil/:id` → student profile: latest measurements, assessment history + trend, training list
- `/alunos/:id/exercicios` → `AssociarExercicio`

**Students, trainers and assessments — rules the UI relies on:**
- A student can be linked to several trainers; profile, exercises and assessment history are shared between them.
- The API answers 404 (`Aluno não encontrado na sua lista.`) for students not linked to the trainer and 403 for non-trainer accounts. Components show `error.response?.data?.message` in a toast and navigate back to `/alunos`.
- Weight, height and IMC are never edited on the student. They change only by registering an assessment (`POST /alunos/:id/avaliacoes` with `{ dataColeta, peso, altura }`); the backend computes IMC and allows one assessment per student per week (Monday–Sunday), returning 409 on duplicates.
- `GET /alunos/:id/avaliacoes` returns `{ historico, tendencia }`; `tendencia` is `null` with fewer than 5 assessments of known date. `MIGRACAO` records are listed in the table but left out of the charts and the model.
- Student↔exercise links go through `/alunos/:id/exercicios/:exercicioId` (POST/DELETE). Do not send an `aluno` array to `/exercicios` — the backend rejects it.
- Public signup (`Cadastro`) shows the peso/altura fields only for the `ALUNO` type.

The model, migration and seed are documented in `AVALIACOES_ML.md`.

**Error handling:** a failed/expired session is detected with `error.toString().includes('401')` → `handleLogout()`. Dates are handled as `YYYY-MM-DD` strings and "today" is computed in `America/Sao_Paulo`.

**Notifications:** Use `ToastAlerta(mensagem, tipo)` from `src/utils/ToastAlerta.ts` with `tipo` as `'sucesso'`, `'erro'`, or `'info'`.

## Root-level scripts

- `start-local.ps1` / `stop-local.ps1` — manage the local services (PIDs tracked in `.local/processes.json`).
- `seed-local.ps1` → `seed-local.cjs` — adapts `../move2fit-backend/sql/seed.sql` to the current model and generates the assessment series; transactional and safe to re-run.
- `migrate-assessments.cjs` — one-off, re-runnable migration that moves peso/altura/imc/classificacao from `tb_usuarios` into `tb_avaliacoes`. On an existing database it must run **before** starting the updated backend, because the backend uses `synchronize: true` and would drop those columns.
- `public/images/avatars-seed/` — local avatars (initials) used by the seeded accounts.

## Git conventions

Branches follow Git Flow: `main` (production), `develop`, `feature/*`, `hotfix/*`, `bugfix/*`. Branch names use kebab-case in English. The repository currently only has `master` (local and on `origin`).

Commits follow Conventional Commits with an emoji prefix:

```
:sparkles: feat: add exercise search filter
:bug: fix: infinite loop on line 50
:recycle: refactor: convert to arrow functions
:books: docs: update README
```
