---
plan: 24-01
phase: 24
status: complete
human_verification: auto_approved
---

# Plano 24-01 — Shell agrupado + sistema de drill-down

## Resultado
- **Task 1** (commit `3c13412`): `ConfigSection` (10 abas) → `ConfigRoute` (home + 11 rotas); `ConfigNavItem` removido; `openConfigRoute` com gating centralizado (deslogado + rota não-APP → redireciona para `'senha'`).
- **Task 2a** (commit `d4a062c`): tokens "drill"/"sgroup"/"scard"/"srow" + componente `ConfigGroupRow` + `ConfigGroupedHome` com os 3 grupos (APP / CONTEÚDO DA CRIANÇA / CUIDADOR) e cadeados 🔒 quando deslogado.
- **Task 2b** (commit `eb77430`): wrapper de detalhe com header "‹ Ajustes" + título; render condicional das 11 sub-rotas; split de "seguranca" em `'senha'` + `'chave-ia'`.
- **Task 3** (checkpoint): auto-aprovado pelo usuário; validação visual em device fica disponível para qualquer ajuste — relatar se algo aparecer fora do esperado.

## Verificação automática
- `npm run lint` (`tsc --noEmit`): limpo.
- Auth handlers preservados verbatim (`handleAdminLogin`, `handleSaveAdminPassword`, `handleUpdateAdminPassword` continuam chamando `setIsConfigModalOpen(false)` em sucesso).
- JSX dos editores preservado verbatim — restyling vem em 24-02/03/04.

## Próximos planos
- 24-02 (grupo App: Voz / Acessibilidade / Aparência)
- 24-03 (grupo Conteúdo da criança: 6 editores)
- 24-04 (grupo Cuidador: Senha + Chave IA + Sair)
