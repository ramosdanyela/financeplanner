# 📚 Documentação do Backend - Finance Planner

## 🌐 Visão Geral

O backend deste projeto é uma **API REST** hospedada no **Railway** que fornece os serviços necessários para o frontend React. O backend não está neste repositório, mas está acessível através de endpoints HTTP.

## 🔗 URLs do Backend

- **Desenvolvimento**: `http://localhost:4000`
- **Produção**: `https://expressfinanceplanner-production.up.railway.app`

## 🔐 Autenticação

O backend utiliza **JWT (JSON Web Tokens)** para autenticação:

- O token é armazenado no `localStorage` do navegador após o login
- Todas as requisições autenticadas incluem o token no header: `Authorization: Bearer <token>`
- O interceptor do Axios adiciona automaticamente o token em todas as requisições

## 📋 Endpoints da API

### 👤 **Endpoints de Usuário**

#### 1. **Cadastro de Usuário**

```
POST /user/sign-up
```

**Body:**

```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "confirmPassword": "string",
  "profileImage": "string (URL da imagem)"
}
```

#### 2. **Login**

```
POST /user/login
```

**Body:**

```json
{
  "email": "string",
  "password": "string"
}
```

**Response:** Retorna o token JWT e dados do usuário

#### 3. **Obter Perfil do Usuário**

```
GET /user/profile
```

**Headers:** `Authorization: Bearer <token>`
**Response:** Dados do perfil do usuário

#### 4. **Editar Perfil**

```
PUT /user/editprofile
```

**Headers:** `Authorization: Bearer <token>`
**Body:**

```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "confirmPassword": "string",
  "profileImage": "string (URL da imagem)"
}
```

---

### 💰 **Endpoints de Transações**

#### 1. **Listar Todas as Transações**

```
GET /transaction/all-transactions
```

**Headers:** `Authorization: Bearer <token>`
**Response:** Array de transações do usuário

#### 2. **Criar Transação**

```
POST /transaction/create
```

**Headers:** `Authorization: Bearer <token>`
**Body:**

```json
{
  "bank": "string",
  "date": "string (ISO date)",
  "value": "number",
  "description": "string",
  "macrotype": "income | outcome",
  "subtype": "string (ex: pix, cash)",
  "category": "string (ID da categoria)",
  "subcategory": "string (ID da subcategoria)",
  "location": "string",
  "notes": "string"
}
```

#### 3. **Editar Transação**

```
PUT /transaction/edit/:id
```

**Headers:** `Authorization: Bearer <token>`
**Params:** `id` - ID da transação
**Body:** Mesmos campos da criação (parciais permitidos)

---

### 📂 **Endpoints de Categorias**

#### 1. **Listar Todas as Categorias**

```
GET /category/all-categories
```

**Headers:** `Authorization: Bearer <token>`
**Response:** Array de categorias

---

### 📁 **Endpoints de Subcategorias**

#### 1. **Listar Todas as Subcategorias**

```
GET /subcategory/all-subcategories
```

**Headers:** `Authorization: Bearer <token>`
**Response:** Array de subcategorias

---

### 🖼️ **Endpoints de Upload de Imagem**

#### 1. **Upload de Imagem**

```
POST /upload-image/
```

**Headers:** `Authorization: Bearer <token>`
**Body:** `FormData` com campo `picture` (arquivo de imagem)
**Response:**

```json
{
  "url": "string (URL da imagem hospedada)"
}
```

---

## 🏗️ Estrutura de Dados

### **Transação**

```javascript
{
  _id: "string",
  bank: "string",
  date: "ISO date string",
  value: "number",
  description: "string",
  macrotype: "income | outcome",
  subtype: "string",
  category: {
    _id: "string",
    name: "string"
  },
  subcategory: {
    _id: "string",
    name: "string"
  },
  location: "string",
  notes: "string",
  user: "string (user ID)"
}
```

### **Categoria**

```javascript
{
  _id: "string",
  name: "string"
}
```

### **Subcategoria**

```javascript
{
  _id: "string",
  name: "string"
}
```

### **Usuário**

```javascript
{
  _id: "string",
  name: "string",
  email: "string",
  profileImage: "string (URL)",
  // ... outros campos
}
```

---

## 🔧 Configuração no Frontend

O frontend está configurado para se conectar automaticamente ao backend correto baseado no ambiente:

```javascript
// src/api/api.js
const apiURLs = {
  development: "http://localhost:4000",
  production: "https://expressfinanceplanner-production.up.railway.app",
};

const api = axios.create({
  baseURL: apiURLs[process.env.NODE_ENV],
});
```

---

## 🔄 Fluxo de Autenticação

1. Usuário faz login → `POST /user/login`
2. Backend retorna token JWT
3. Token é salvo no `localStorage`
4. Interceptor do Axios adiciona token em todas as requisições subsequentes
5. Backend valida token em cada requisição protegida

---

## 📝 Observações Importantes

1. **Todas as rotas de transações, categorias e subcategorias requerem autenticação**
2. **O token expira após um período determinado** (configurado no backend)
3. **As transações são filtradas automaticamente por usuário** no backend
4. **O upload de imagens retorna uma URL** que deve ser usada ao criar/editar usuário
5. **O backend provavelmente usa MongoDB** (baseado na estrutura `_id` dos objetos)

---

## 🛠️ Tecnologias Prováveis do Backend

Baseado na estrutura da API e nos padrões observados:

- **Node.js** com **Express.js**
- **MongoDB** (ou similar NoSQL)
- **JWT** para autenticação
- **Multer** ou similar para upload de imagens
- **Cloudinary** ou similar para hospedagem de imagens
- **Mongoose** (se MongoDB) para ODM

---

## 📌 Próximos Passos para Entender Melhor

Para entender completamente o backend, você precisaria:

1. Acessar o código-fonte do backend (repositório separado)
2. Verificar o banco de dados (estrutura de schemas)
3. Revisar os middlewares de autenticação
4. Entender a lógica de negócio por trás de cada endpoint

---

**Nota:** Este documento foi criado baseado na análise do código frontend. Para informações mais precisas, consulte a documentação oficial do backend ou o código-fonte do servidor.
