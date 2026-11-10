---
name: code-review
description: Checklist e diretrizes para revisão de código simples, limpo e direto no padrão do projeto backend de TADS (2º semestre).
---

# Code Review Best Practices

> Checklist de revisão de código focado no backend acadêmico: clareza, validação TypeScript, ESM e simplicidade.

## 🎯 Objetivos da Revisão

- **Alinhamento com o AGENTS.md**: Garantir que as regras e limites do projeto foram rigorosamente respeitados.
- **Simplicidade & Nível Pedagógico**: Evitar sobre-engenharia e padrões corporativos complexos não condizentes com o 2º semestre.
- **Segurança Básica & Integridade**: Proteger `.env`, credenciais e garantir persistência segura no banco.

---

## 🔍 Checklist de Revisão

- **Convenções TypeScript & ESM**:
  - [ ] Compilação validada sem erros com `npm run build` (`tsc`).
  - [ ] Todos os imports relativos possuem a extensão `.js` obrigatória para `"module": "nodenext"`.
  - [ ] Nenhuma dependência nova adicionada ao `package.json` sem autorização prévia.
- **Arquitetura & Design**:
  - [ ] A lógica de rotas está em `routes/`, controle em `controllers/` e definição de dados em `models/`.
  - [ ] Não há criação de camadas desnecessárias (ex.: repositórios abstratos, factories ou wrappers extras de model).
  - [ ] O código faz apenas o que foi solicitado (alteração cirúrgica, sem refatorações não pedidas).
- **Tratamento de Requisições e Erros**:
  - [ ] Uso de blocos `try/catch` nos controllers para capturar exceções assíncronas.
  - [ ] Retorno com status HTTP semântico (200, 201, 400, 404, 409, 500) e mensagem clara em JSON.
  - [ ] Nenhum detalhe sensível do banco exposto nas respostas de erro.
- **Segurança & Boas Práticas**:
  - [ ] Nenhuma credencial ou token fixo no código (`process.env` utilizado).
  - [ ] Nenhuma tentativa de ler ou expor o arquivo `.env`.
  - [ ] Nenhum comando perigoso/destrutivo de banco (`sync({ force: true })`, `DROP`).

---

## 💬 Convenção de Comentários

- `issue`: Problema crítico (erro de tipagem TypeScript, import sem `.js`, falha de segurança, credencial exposta, quebra de guardrail).
- `suggestion`: Melhoria opcional de legibilidade ou clareza do código.
- `nitpick`: Ajuste cosmético pequeno (espaçamento, nomenclatura).
- `praise`: Elogio a uma solução simples, direta e bem implementada.
