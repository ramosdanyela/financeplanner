# Rodar Frontend e Backend no Mesmo Repositório (Monorepo)

Este documento explica a estrutura do projeto com **frontend** (React/Vite) e **backend** (Node/Express) no mesmo repositório e como rodar e testar tudo localmente.

---

## 1. Estrutura atual do repositório

O backend oficial fica em **`backend/express2`**. O frontend fica em **`frontend/`**. A raiz tem só scripts que rodam os dois.

```
financeplanner/
├── backend/
│   ├── express/             # (legado; pode ignorar)
│   └── express2/            # ← Backend oficial (API Node/Express)
│       ├── .env.example
│       ├── .gitignore
│       ├── package.json
│       ├── index.js
│       ├── config/
│       ├── middlewares/
│       ├── models/
│       └── routes/
│
├── frontend/                 # ← Frontend React (Vite)
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   └── ...
│   ├── public/
│   ├── index.html
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.js
│   └── ...
├── docs/
├── package.json              # Scripts: dev, dev:backend, dev:all (concurrently)
└── ...
```

---

## 2. O que você precisa ter instalado

- **Node.js** (v18 ou superior) – [nodejs.org](https://nodejs.org)
  - Necessário para rodar frontend e backend.
- **MongoDB** – uma das opções:
  - **MongoDB Atlas** (recomendado): criar conta em [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas), criar um cluster e copiar a URI de conexão para o `.env` do backend.
  - **MongoDB local**: instalar e rodar na sua máquina e usar `mongodb://localhost:27017/financeplanner` no `.env`.

Se faltar algum, aviso: **precisa instalar Node.js**. Para o banco, usar Atlas dispensa instalar MongoDB na máquina.

---

## 3. Configuração inicial (uma vez)

### 3.1 Dependências da raiz (só o script que sobe os dois)

Na **raiz** do repositório:

```bash
npm install
```

Isso instala só o `concurrently` (para rodar backend e frontend juntos).

### 3.2 Dependências do frontend

Dentro da pasta do frontend:

```bash
cd frontend
npm install
cd ..
```

### 3.3 Dependências do backend

Dentro do backend oficial:

```bash
cd backend/express2
npm install
cd ../..
```

### 3.4 Variáveis de ambiente do backend

O backend usa um arquivo `.env` em `backend/express2/`. Ele **não** vai no Git (está no `.gitignore`).

1. Copie o exemplo:
   ```bash
   cp backend/express2/.env.example backend/express2/.env
   ```
2. Edite `backend/express2/.env` e preencha:
   - **PORT** – ex.: `4000` (igual ao que o frontend usa em dev).
   - **MONGODB_URI** – URI do MongoDB (Atlas ou local), ex.: `mongodb+srv://usuario:senha@cluster.mongodb.net/financeplanner` ou `mongodb://localhost:27017/financeplanner`.
   - **TOKEN_SIGN_SECRET** – uma string segreta para o JWT (ex.: uma senha longa aleatória).
   - **CLOUDINARY_NAME**, **CLOUDINARY_API_KEY**, **CLOUDINARY_SECRET** – para upload de imagem de perfil (conta em [cloudinary.com](https://cloudinary.com)); se não for usar upload ainda, pode deixar em branco, mas o backend pode reclamar dependendo do uso.

### 3.5 (Opcional) Frontend – URL da API

Se quiser sobrescrever a URL da API no frontend (por padrão em dev já é `http://localhost:4000`):

- Copie o exemplo no frontend: `cp frontend/.env.example frontend/.env`
- Edite `frontend/.env` e use, por exemplo: `VITE_API_URL=http://localhost:4000`

---

## 4. Como rodar e testar localmente

### Opção A: Um comando (recomendado)

Na **raiz** do repositório:

```bash
npm run dev:all
```

Isso sobe:

- Backend em **http://localhost:4000**
- Frontend em **http://localhost:5173** (Vite)

Abra o navegador em **http://localhost:5173**, faça login/cadastro e use o app; as chamadas da interface vão para a API em `localhost:4000`.

### Opção B: Dois terminais

**Terminal 1 – backend:**

```bash
cd backend/express2
npm run dev
```

**Terminal 2 – frontend (raiz):**

```bash
npm run dev
```

Resultado: mesmo que a Opção A – backend na 4000, frontend na 5173.

---

## 5. Scripts disponíveis na raiz

| Comando               | O que faz                                      |
| --------------------- | ---------------------------------------------- |
| `npm run dev`         | Sobe só o frontend (Vite).                     |
| `npm run dev:backend` | Sobe só o backend (express2).                  |
| `npm run dev:all`     | Sobe backend + frontend juntos (testar local). |
| `npm run build`       | Build de produção do frontend.                 |
| `npm run preview`     | Preview do build do frontend.                  |

---

## 6. Conferir se está tudo ligado

1. Subir com `npm run dev:all` (ou os dois terminais).
2. Backend: abrir **http://localhost:4000/welcome** no navegador; deve retornar algo como `{ "message": "Bem vindo!" }`.
3. Frontend: abrir **http://localhost:5173** e testar login/cadastro e uma transação; se funcionar, o código está ligado (front → back) localmente.

---

## 7. Subir a nova estrutura no remoto (Git)

Tudo já está organizado para um único repositório:

1. Commitar as alterações (package.json da raiz, `api.js`, `.gitignore`, `.env.example`, `backend/express2/.env.example`, esta doc).
2. Dar push para o remoto:
   ```bash
   git add .
   git commit -m "Monorepo: frontend + backend express2, scripts dev:all e docs"
   git push origin main
   ```
   (troque `main` pelo nome da sua branch.)

Não commite o arquivo **`backend/express2/.env`** (ele já está ignorado). No servidor (ex.: Railway), configure as variáveis de ambiente pela interface do provedor.

---

## 8. Resumo

- **Backend oficial:** `backend/express2`.
- **Rodar os dois localmente:** na raiz, `npm run dev:all` (ou dois terminais com `npm run dev:backend` e `npm run dev`).
- **O que instalar:** Node.js; MongoDB (Atlas ou local) para o backend.
- **Configuração:** preencher `backend/express2/.env` a partir de `.env.example`.
- Para subir no remoto: commitar e dar push; em produção, configurar as variáveis de ambiente do backend no serviço onde a API roda.
