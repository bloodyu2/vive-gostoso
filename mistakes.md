# Erros: Vive Gostoso

> Responde: **que erro não pode acontecer de novo?**
> Registrar antes de seguir sempre que algo falhar. Formato: data, o que aconteceu, e a regra que fica.

---

## 2026-09-24: node_modules ligado entre worktree e checkout principal
**O que aconteceu:** no PR #23, o `node_modules` da worktree foi ligado (link) ao `node_modules` do checkout principal para rodar os testes. Ao remover a worktree com `git worktree remove --force`, o git seguiu o link e apagou parte do `node_modules` principal. Foi reinstalado com `npm ci` e nada foi perdido no repositório.
**Regra:** em worktree, rodar `npm ci` próprio, nunca ligar ao `node_modules` de outro checkout. Remover a worktree sem `--force`; se não sair limpo, investigar o motivo antes de forçar.

## 2026-09-23: Push direto na master é proibido
**O que aconteceu:** a regra nasceu do commit `b0c961f` no balaio-digital em 23/09/2026: outro agente empurrou direto na `main` de lá, sem PR e sem preview, e foi a produção.
**Regra:** Push direto na master é proibido, inclusive para agentes. Todo trabalho entra por PR com preview verde. Agente trabalha em worktree próprio, nunca no checkout principal.
**Observação:** o GitHub agora bloqueia: branch protection na master exige PR, check Vercel verde, vale para admins, sem force push e sem apagar a branch (ativado em 23/09/2026).
