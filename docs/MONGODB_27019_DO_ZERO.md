# MongoDB do Finance Planner na 27019 – começar do zero

## 1. Subir o MongoDB (porta 27019)

Na raiz do projeto ou em `backend/express2`:

```bash
npm run mongo
```

Deixe esse terminal aberto. Você deve ver: **Iniciando MongoDB na porta 27019**.

---

## 2. Conectar no MongoDB Compass

1. Abra o **MongoDB Compass**.
2. Em **New Connection**, use esta connection string:

   ```
   mongodb://localhost:27019
   ```

3. Clique em **Connect**.

O banco `financeplanner` ainda não existe; ele é criado quando você se cadastrar ou o backend gravar algo.

---

## 3. Subir o backend

Em **outro** terminal:

```bash
npm run dev:backend
```

Deve aparecer: **Connect to DB: financeplanner**.

---

## 4. Usar o app

- Frontend: `npm run dev` (se ainda não estiver rodando).
- Acesse o app, faça **Sign up** para criar seu usuário.
- Depois disso o banco `financeplanner` e as collections (users, transactions, etc.) aparecem no Compass.

---

## Resumo

| O quê              | Porta / URL                          |
|--------------------|--------------------------------------|
| MongoDB (este app) | **27019**                            |
| Connection Compass | `mongodb://localhost:27019`         |
| Backend API        | http://localhost:4000                |
