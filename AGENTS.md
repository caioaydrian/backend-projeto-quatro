# AGENTS.md

## Visão Geral do Projeto

- **Descrição:** Backend REST API do Quarto Projeto de TADS (2º semestre).
- **Filosofia:** Simplicidade total. Código direto, legível e sem sobre-engenharia.
- **Stack:** Node.js (ESM), TypeScript, Express, Sequelize, MySQL.

## Comandos

- **Desenvolvimento:** `npm run dev` (executa `tsx watch src/app.ts` na porta 3000)
- **Build:** `npm run build` (`tsc`)
- **Iniciar:** `npm start` (`node dist/app.js`)

## Arquitetura e Diretrizes de Código

- **Estrutura:**
  - `src/controllers/`: Controladores e validações da requisição (ex.: `user.controller.ts`).
  - `src/models/`: Modelos do Sequelize herdando diretamente de `Model` (ex.: `user.ts`, `drink.ts`).
  - `src/routes/`: Definição de rotas do Express (ex.: `user.routes.ts`).
  - `src/database/`: Conexão e inicialização do Sequelize (`sequelize.ts`).
- **Imports ESM:** Projeto com `"module": "nodenext"`. SEMPRE use extensão `.js` em imports relativos (ex.: `import { User } from "../models/user.js";`).
- **Sequelize Direto:** Use os métodos nativos dos models (`User.create`, `User.findOne`, etc.). Não crie camadas de repositório abstratas ou wrappers genéricos.
- **Respostas e Erros:** Retorne JSON objetivo com códigos de status HTTP semânticos (200, 201, 400, 404, 409, 500).

## Regras e Limites (O que fazer e o que não fazer)

- **Fazer:** Priorizar soluções simples, diretas e pedagógicas para o nível de 2º semestre.
- **Fazer:** Fazer alterações cirúrgicas, restritas estritamente ao que foi pedido.
- **Não fazer:** NÃO criar camadas arquiteturais complexas (Repositórios abstratos, CQRS, Factories desnecessárias).
- **Não fazer:** NÃO colocar senhas, segredos ou tokens fixos no código; use `process.env`.
