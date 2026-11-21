# Backend - Quarto Projeto (TADS)

Backend completo do Quarto Projeto da faculdade de TADS.

## Executando com Docker Compose

Para subir toda a aplicação (Banco MySQL, Backend, Frontend e Proxy Reverso Nginx):

1. Certifique-se de que a pasta do frontend e do backend estejam no mesmo nível, nomeadas como `frontend` e `backend`:

   ```text
   meu-projeto/
   ├── backend/   (este repositório)
   └── frontend/  (repositório do frontend)
   ```

2. Na pasta do backend, execute:

   ```bash
   docker compose up --build
   ```

3. Acesse a aplicação no navegador em:
   - Aplicação web: [http://localhost](http://localhost)
   - Apenas o Nginx expõe portas externamente (porta 80), garantindo o isolamento da rede interna dos containers.
