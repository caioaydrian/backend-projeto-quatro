---
name: security
description: Diretrizes essenciais de segurança para a API Express/Sequelize do projeto de TADS (2º semestre) no padrão Awesome.
---

# Security Guidelines

> Checklist e boas práticas práticas e essenciais de segurança para API REST com Node.js, Express, Sequelize e MySQL.

## 🛡️ Regras Fundamentais

- **Segredos e `.env`**:
  - Nunca ler, versionar ou exibir valores de variáveis de ambiente (`.env`).
  - Nunca commitar senhas, chaves de API ou tokens fixos no código (use sempre `process.env`).
  - O arquivo `.env` deve estar sempre presente no `.gitignore`.
- **Hasheamento de Senhas**:
  - Nunca salvar senhas em texto puro no banco de dados.
  - Usar hash seguro (ex.: `bcrypt`) antes de persistir o usuário (`User.create`).
- **Validação de Entrada**:
  - Validar campos obrigatórios, tipos e tamanhos no início de cada método de controller.
  - Rejeitar payloads inválidos com HTTP 400 antes de tocar o banco de dados.

---

## 🔒 Proteção da API e Banco de Dados

- **SQL Injection**:
  - Usar estritamente os métodos nativos dos models do Sequelize (`findOne`, `create`, `update`, `destroy`).
  - Nunca concatenar strings em queries cruas ou raw queries.
- **Vazamento de Dados Sensíveis**:
  - Nunca retornar o campo de senha (ou hash) nas respostas JSON dos endpoints.
  - Ocultar detalhes de erro interno, credenciais ou stack trace do banco nas respostas HTTP 500 para o cliente.
- **Autenticação e Autorização**:
  - Proteger rotas privadas validando o token JWT via middleware Express.
  - Confirmar a identidade do usuário antes de permitir alterar ou excluir recursos.

---

## 🧰 Security Checklist

- [ ] `.env` devidamente ignorado no `.gitignore`.
- [ ] Nenhuma credencial ou token fixo presente no código fonte.
- [ ] Validações de requisição presentes nos controllers antes de chamar o Sequelize.
- [ ] Senhas de usuários salvas com hash e nunca expostas nos retornos JSON.
- [ ] Respostas de erro amigáveis sem expor dados internos de infraestrutura ou banco.
