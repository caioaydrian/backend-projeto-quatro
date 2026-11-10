---
name: backend-architecture
description: Diretrizes de arquitetura simples e direta em camadas (Routes, Controllers, Models) para API Express/Sequelize de TADS (2º semestre).
---

# Backend Architecture Guidelines

> Padrão simples em camadas para a API REST do projeto acadêmico de TADS (Node.js, TypeScript, Express, Sequelize, MySQL).

## 🏛️ Filosofia e Estrutura em Camadas

- **Simplicidade Total**: Código direto, legível e sem sobre-engenharia.
- **Sem Camadas Abstratas**: Não criar repositórios abstratos, factories, CQRS ou Hexagonal Architecture. O Sequelize é consumido diretamente nos controllers.
- **Organização de Pastas**:
  - `src/routes/`: Mapeamento de endpoints e verbos HTTP (`user.routes.ts`).
  - `src/controllers/`: Recebimento de requisição (`req`), validação simples, orquestração com models e envio de resposta (`res`).
  - `src/models/`: Definição de tabelas e entidades herdando diretamente de `Model` do Sequelize (`user.ts`, `drink.ts`).
  - `src/database/`: Conexão e configuração da instância do Sequelize (`sequelize.ts`).

---

## ⚡ Regras do Stack e Convenções

- **Imports ESM Obrigatórios**:
  - Configuração `"module": "nodenext"`.
  - **Sempre** incluir a extensão `.js` em imports relativos (ex.: `import { User } from "../models/user.js";`).
- **Sequelize Direto**:
  - Operações diretas via métodos dos models: `User.create()`, `User.findByPk()`, `User.findOne()`, etc.
  - Nunca executar comandos destrutivos no banco (`sync({ force: true })`, `DROP TABLE`).
- **Respostas HTTP Semânticas**:
  - `200 OK`: Consulta ou atualização bem-sucedida.
  - `201 Created`: Recurso criado com sucesso.
  - `400 Bad Request`: Parâmetros ausentes ou inválidos.
  - `404 Not Found`: Recurso não localizado.
  - `409 Conflict`: Violação de unicidade (ex.: e-mail já cadastrado).
  - `500 Internal Server Error`: Erro inesperado do servidor.

---

## 📐 Architecture Checklist

- [ ] Separação clara entre rota (`routes/`), lógica de requisição (`controllers/`) e modelo (`models/`).
- [ ] Imports relativos com extensão `.js`.
- [ ] Chamadas diretas aos models do Sequelize sem classes intermediárias ou repositórios genéricos.
- [ ] Status HTTP semânticos acompanhados de payload JSON claro (`{ message: "..." }`).
- [ ] Modificações cirúrgicas sem introduzir complexidade ou bibliotecas desnecessárias.
