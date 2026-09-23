# Erros: Vive Gostoso

> Responde: **que erro não pode acontecer de novo?**
> Registrar antes de seguir sempre que algo falhar. Formato: data, o que aconteceu, e a regra que fica.

---

## 2026-09-23: Push direto na master é proibido
**O que aconteceu:** a regra nasceu do commit `b0c961f` no balaio-digital em 23/09/2026: outro agente empurrou direto na `main` de lá, sem PR e sem preview, e foi a produção.
**Regra:** Push direto na master é proibido, inclusive para agentes. Todo trabalho entra por PR com preview verde. Agente trabalha em worktree próprio, nunca no checkout principal.
**Observação:** o GitHub agora bloqueia: branch protection na master exige PR, check Vercel verde, vale para admins, sem force push e sem apagar a branch (ativado em 23/09/2026).
