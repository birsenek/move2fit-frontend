# Padrões de Commits e Branches

Este documento serve como guia de referência para os padrões de branches utilizados neste projeto.

## 🌳 Branches

Seguimos uma adaptação do [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/) para gerenciamento de branches.

### Branches Principais

- `main`: Código em produção
- `develop`: Código em desenvolvimento

### Branches de Suporte

- `feature/*`: Novas funcionalidades
- `hotfix/*`: Correções urgentes
- `bugfix/*`: Correções não urgentes

### Padrão de Nomenclatura

```
feature/login-system
feature/user-profile
hotfix/security-fix
bugfix/validation-error
```

## 📋 Boas Práticas

### Para Branches

1. Use nomes descritivos em inglês
2. Use kebab-case para separar palavras
3. Inclua o número da issue quando relevante
    - `feature/123-user-authentication`
