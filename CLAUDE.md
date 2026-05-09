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

To stop the dev server: `pkill -f vite` or `lsof -ti:5173 | xargs kill`

**Docker:**
```bash
docker compose up   # run via Docker (copy .env.example to .env first)
```

## Environment

Copy `.env.example` to `.env` and set `VITE_API_URL` to the backend base URL before running.

## Architecture

**Stack:** React 19, TypeScript, Vite, Tailwind CSS 4 (loaded via `@tailwindcss/vite` plugin, not PostCSS), React Router v7, Axios, React Toastify.

**Auth flow:** `AuthContext` (`src/contexts/AuthContext.tsx`) holds a `UsuarioLogin` state with the JWT `token`. After login, every authenticated API call passes the token as `{ headers: { Authorization: token } }` via the `header` parameter in the service functions. Auth state is in-memory only — it resets on page refresh.

**Service layer:** `src/services/Service.ts` exports thin wrappers (`buscar`, `cadastrar`, `atualizar`, `deletar`, `login`, `cadastrarUsuario`) around an Axios instance configured with `VITE_API_URL` as `baseURL`. All components call these functions directly — there is no intermediate state management library.

**Domain models** (`src/models/`):
- `Categoria` — exercise category (id, nome, descricao, icone)
- `Exercicio` — exercise with carga (weight), repeticao, tempo; belongs to one `Categoria` and optionally many `Aluno`s
- `Aluno` — student/athlete with peso, altura, imc, classificacao; has many `Exercicio`s
- `Usuario` / `UsuarioLogin` — authentication user (login response includes the JWT token)

**Component pattern:** Each entity (`categorias`, `exercicios`, `aluno`) follows the same structure under `src/components/<entity>/`:
- `Lista<Entity>` — fetches and lists all records
- `Form<Entity>` — handles both create (`/store`) and edit (`/edit/:id`) via a single component
- `Deletar<Entity>` — confirmation + deletion
- `Card<Entity>` — display card used inside the list

**Routes** (defined in `App.tsx`):
- `/ ` → `HomePage` (public landing)
- `/login`, `/cadastro` → `LoginCadastroForm`
- `/home` → authenticated home dashboard
- `/categorias`, `/exercicios`, `/alunos` → list views
- `/<resource>/store`, `/<resource>/edit/:id`, `/<resource>/detroy/:id` → CRUD (note: the delete route path is `detroy`, not `destroy` — kept for backend compatibility)
- `/alunos/perfil/:id` → student profile with IMC info

**Notifications:** Use `ToastAlerta(mensagem, tipo)` from `src/utils/ToastAlerta.ts` with `tipo` as `'sucesso'`, `'erro'`, or `'info'`.

## Git conventions

Branches follow Git Flow: `main` (production), `develop`, `feature/*`, `hotfix/*`, `bugfix/*`. Branch names use kebab-case in English.

Commits follow Conventional Commits with an emoji prefix:

```
:sparkles: feat: add exercise search filter
:bug: fix: infinite loop on line 50
:recycle: refactor: convert to arrow functions
:books: docs: update README
```
