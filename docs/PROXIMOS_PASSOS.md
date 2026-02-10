# Próximos passos – o que falta fazer

Use este checklist na ordem. Quando tudo estiver ✅, você consegue rodar e testar tudo local e depois subir no remoto.

---

## 1. Dependências

- [ ] **Raiz** – Na pasta do projeto (raiz do repositório):
  ```bash
  npm install
  ```
- [ ] **Frontend** – Instalar dependências do frontend:
  ```bash
  cd frontend
  npm install
  cd ..
  ```
- [ ] **Backend** – Instalar dependências do backend:
  ```bash
  cd backend/express2
  npm install
  cd ../..
  ```

---

## 2. Banco de dados (MongoDB)

Você precisa de um MongoDB acessível. Escolha uma opção:

- [ ] **MongoDB Atlas** (recomendado, não precisa instalar nada na máquina):

  1. Criar conta em [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
  2. Criar um cluster (free)
  3. Em _Database_ → _Connect_ → _Connect your application_, copiar a **connection string** (URI)
  4. Colar no `.env` do backend (passo 3 abaixo) em **MONGODB_URI**

- [ ] **MongoDB local**: instalar MongoDB na sua máquina, garantir que está rodando e usar no `.env`:
      `MONGODB_URI=mongodb://localhost:27017/financeplanner`

---

## 3. Configurar o `.env` do backend

O arquivo **`backend/express2/.env`** já existe (foi criado a partir do exemplo). Abra e ajuste:

- [ ] **MONGODB_URI** – URI do Atlas ou `mongodb://localhost:27017/financeplanner` se for local
- [ ] **TOKEN_SIGN_SECRET** – troque `seu_jwt_secret_aqui` por uma string segreta forte (ex.: uma senha longa ou gere uma aleatória)
- [ ] **CLOUDINARY** – só se for usar upload de foto de perfil; senão pode deixar em branco (o app funciona; upload de imagem pode dar erro nesse fluxo)

Salve o arquivo.

---

## 4. Rodar e testar localmente

Na **raiz** do projeto:

```bash
npm run dev:all
```

- [ ] Backend sobe em **http://localhost:4000** (teste rápido: abra [http://localhost:4000/welcome](http://localhost:4000/welcome) – deve aparecer algo como `{"message":"Bem vindo!"}`)
- [ ] Frontend sobe em **http://localhost:5173**
- [ ] Abra **http://localhost:5173**, faça cadastro/login e teste uma transação para confirmar que front e back estão ligados

Se der erro de conexão com o MongoDB, confira o **MONGODB_URI** no `backend/express2/.env` e se o cluster (Atlas) ou o MongoDB local está ativo.

---

## 5. Subir no remoto (Git)

Quando tudo estiver funcionando localmente:

- [ ] Commitar as alterações (não commitar `backend/express2/.env` – já está no `.gitignore`)
- [ ] Dar push para o repositório remoto:
  ```bash
  git add .
  git status   # conferir o que vai subir (não deve aparecer .env)
  git commit -m "Monorepo: frontend + backend express2, scripts e docs"
  git push origin main
  ```
  (troque `main` pela sua branch, se for outra.)

Em produção (Railway, Render, etc.), configurar as **variáveis de ambiente** do backend na interface do serviço (MONGODB*URI, TOKEN_SIGN_SECRET, CLOUDINARY*\*, PORT).

---

## Resumo rápido

| O que                  | Onde / Comando                                        |
| ---------------------- | ----------------------------------------------------- |
| Instalar deps raiz     | `npm install` (na raiz)                               |
| Instalar deps frontend | `cd frontend && npm install`                          |
| Instalar deps backend  | `cd backend/express2 && npm install`                  |
| Configurar banco e JWT | Editar `backend/express2/.env`                        |
| Subir os dois          | `npm run dev:all` (na raiz)                           |
| Testar                 | http://localhost:5173 e http://localhost:4000/welcome |
| Enviar pro remoto      | `git add .` → `git commit` → `git push`               |

Detalhes: [MONOREPO_FRONTEND_BACKEND.md](MONOREPO_FRONTEND_BACKEND.md).
