# Estratégia de investigação: erros no Sign-up

## Erros observados

1. **POST /upload-image/ → 500 (Internal Server Error)**  
   Chamado em `SignUpPage.jsx` dentro de `handleSubmit` → `handleUpload()`.

2. **POST /user/sign-up → 400 (Bad Request)**  
   Chamado logo após o upload (ou em paralelo ao fluxo); payload: `{ ...form, profileImage: imgURL }`.

---

## Causas identificadas

### 1. 500 no upload de imagem

- **Fluxo:** O sign-up **sempre** chama `handleUpload()` antes do `POST /user/sign-up`, mesmo quando o usuário **não escolhe foto**.
- **Problema:** Com `img === ""` (nenhum arquivo), o frontend envia `FormData` com `picture: ""`. O backend espera um arquivo; `req.file` fica `undefined` → o código faz `throw new Error("Algo deu errado...")` → resposta 500.
- **Outra possibilidade:** Variáveis de ambiente do Cloudinary (`CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_SECRET`) não configuradas ou inválidas → erro no upload → 500.

**Conclusão:** Upload deve ser **opcional**. Só chamar `/upload-image/` quando houver arquivo selecionado; caso contrário, não enviar `profileImage` (ou enviar `undefined`) e deixar o backend usar o valor default do modelo.

### 2. 400 no sign-up

- **Único 400 no backend** (em `user.router.js`) é a validação de senha:
  - Regex: `^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[$*&@#])[0-9a-zA-Z$*&@#]{8,}$`
  - Exige: pelo menos 1 número, 1 minúscula, 1 maiúscula, 1 caractere entre `$*&@#`, apenas esses caracteres, mínimo 8 caracteres.
- **Mensagem retornada:** `"A senha escolhida nao tem os requisitos necessários."`
- O frontend não exibe essa mensagem; só mostra "Error creating account. Please try again.", então o usuário não sabe que o problema é a senha.

**Conclusão:** Exibir no frontend a mensagem de erro do backend (`error.response?.data?.message`) para o 400, e/ou adicionar validação de senha no frontend com a mesma regra e uma mensagem clara (ex.: requisitos da senha).

---

## Resumo da estratégia de investigação

| Passo | O que fazer                                                                                                                         |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 1     | Analisar `SignUpPage`: ordem das chamadas (`handleUpload` → `sign-up`), payload e tratamento de erro.                               |
| 2     | Backend `/user/sign-up`: ver onde retorna 400 (só na validação de senha) e qual mensagem.                                           |
| 3     | Backend `/upload-image`: ver quando `req.file` é `undefined` (sem arquivo ou multer não preenche) e se Cloudinary está configurado. |
| 4     | Modelo User: confirmar campos aceitos e default de `profileImage`.                                                                  |
| 5     | Ajustar frontend: upload opcional + exibir mensagem do backend no 400 (e opcionalmente validar senha no frontend).                  |

---

## Correções aplicadas

| Onde                 | O que foi feito                                                                                                                                                                                                                                                                   |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SignUpPage.jsx**   | Upload só é chamado quando há arquivo (`img` truthy); payload do sign-up envia apenas `name`, `email`, `password` e `profileImage` (se houver); erro do backend (`error.response?.data?.message`) é exibido na tela; adicionada dica de requisitos da senha no label/placeholder. |
| **user.router.js**   | Sign-up usa apenas `name`, `email`, `profileImage` do body (não espalha `password`/`confirmPassword`); erro 11000 (e-mail duplicado) → 400 com "E-mail já cadastrado."; ValidationError → 400; demais erros → 500 com mensagem.                                                   |
| **upload.router.js** | Quando não há arquivo, responde 400 com "Nenhuma imagem enviada." em vez de 500; resposta de erro 500 com `message` em vez do objeto de erro bruto.                                                                                                                               |

Assim, o fluxo sem foto não chama upload (evita 500) e o usuário vê a mensagem correta quando a senha não atende ou o e-mail já existe.
