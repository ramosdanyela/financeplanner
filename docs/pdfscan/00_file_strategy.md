# PDF Import Pipeline — Inbox → Detect → Parse → Review → Commit (Sem IA)

Este documento descreve uma arquitetura **determinística e auditável** para importar históricos financeiros em PDF (faturas/extratos) para o app.  
O fluxo permite colocar PDFs em uma pasta local (ignorados no Git), detectar automaticamente o banco, parsear com o parser correto, validar no front e só então subir os dados para o banco estruturado com **dedupe forte**.

---

# 1) Objetivo

- Permitir importar PDFs em lote sem subir arquivos sensíveis para o repositório
- Detectar automaticamente o banco (Nubank, Itaú, Bradesco, etc.)
- Aplicar o parser correto por banco
- Gerar uma fila de validação no front
- Evitar duplicação de PDFs e de transações no banco
- Manter histórico auditável de importações

---

# 2) Estrutura de Pastas

Crie dentro do repositório:

/data/
/pdf_inbox/ # onde você joga PDFs novos
/parsed_cache/ # JSON do parse por arquivo
/import_queue/ # batches prontos para validação no front
/imported/ # PDFs já importados
/failed/ # PDFs que falharam no parse/detecção
/manifests/ # logs/auditoria (opcional, pode ser versionado)


---

# 3) .gitignore

Adicione:
/data/pdf_inbox/
/data/parsed_cache/
/data/import_queue/
/data/imported/
/data/failed/


> `/data/manifests/` pode ficar versionado se você quiser histórico no Git.

---

# 4) Estados do Pipeline

Cada PDF vira um **Import Batch** com status:

- `new` → arquivo detectado no inbox
- `parsed` → parser executado, JSON salvo
- `pending_review` → precisa validação humana
- `ready_to_commit` → sem pendências
- `imported` → dados gravados no banco
- `failed` → erro de parse/detecção

---

# 5) Identificadores (Base de Segurança do Sistema)

## 5.1 Identificador do Arquivo (PDF)

Para não reimportar o mesmo PDF:

Salve no banco:

- `file_hash` (unique)
- `filename`
- `bank`
- `status`
- `createdAt`
- `importedAt`

Se um PDF com o mesmo hash aparecer:
- marque como “já importado”
- não reprocesse

---

## 5.2 Identificador por Transação (Dedupe Forte)

Cada transação recebe um **fingerprint determinístico**:

transaction_fingerprint = sha256(
bankId + "|" +
(postedAt ?? "null") + "|" +
amountCents + "|" +
normalize(description) + "|" +
(cardLast4 ?? "")
)


### normalize(description)
- UPPERCASE
- trim
- colapsar espaços múltiplos
- remover tabs e aspas
- opcional: remover acentos (São → SAO)

### Banco de dados
- Criar índice único em `transaction_fingerprint`
- Fazer `upsert` no commit

---

# 6) Detecção de Banco (Como o sistema sabe se é Itaú, Bradesco, Nubank)

## 6.1 Princípio
Nunca confie no nome do arquivo.  
Use **assinaturas no conteúdo do PDF** (texto extraído).

## 6.2 Interface do Detector

```ts
type BankId = "nubank" | "itau" | "bradesco" | "unknown";

type DetectResult = {
  bankId: BankId;
  parserKey?: string;
  score: number; // 0..1
  evidence: string[];
};

interface BankDetector {
  id: BankId;
  parserKey: string;
  detect(textSample: string): DetectResult | null;
}

6.3 Estratégia de Score

Cada detector soma pontos por palavra-chave

Score final = maior pontuação

Regras:

score < 0.6 → unknown

diferença top1-top2 < 0.15 → unknown (ambíguo)

7) Assinaturas por Banco
7.1 Nubank

Assinaturas fortes:

TRANSAÇÕES DE (+0.6)

NUBANK (+0.6)

Médias:

CONVERSÃO: USD 1 = R$ (+0.4)

IOF DE " (+0.3)

7.2 Itaú Cartões (LATAM PASS / Mastercard)

Assinaturas fortes:

ITAU (+0.6)

LANÇAMENTOS: COMPRAS E SAQUES (+0.6)

LANÇAMENTOS INTERNACIONAIS (+0.6)

DATA ESTABELECIMENTO VALOR EM R$ (+0.6)

Médias:

DÓLAR DE CONVERSÃO (+0.4)

PRODUTOS E SERVIÇOS (+0.3)

POSTAGEM: (+0.2)

EMISSÃO: (+0.2)

VENCIMENTO: (+0.2)

8) Scanner de Inbox (Backend)
Responsabilidades

Para cada PDF em /data/pdf_inbox:

Ler bytes

Gerar file_hash

Se já existe em imports como imported → ignorar/mover

Extrair textSample (primeiras páginas)

detectBank(textSample)

Se unknown:

criar batch com status pending_review

aguardar seleção manual no front

Se detectado:

chamar parser correto

Salvar parseResult em:

/data/parsed_cache/<file_hash>.json
/data/import_queue/<file_hash>.json

Se erro:

mover PDF para /data/failed

9) Estrutura do ImportBatch (Fila)

{
  "file_hash": "abc123",
  "filename": "FATURA_2024_09.pdf",
  "bankId": "itau",
  "parserKey": "itauCardLatamPass",
  "status": "pending_review",
  "stats": {
    "transactions": 120,
    "needsReview": 4,
    "warnings": 1
  },
  "parseResultPath": "data/parsed_cache/abc123.json",
  "detector": {
    "score": 0.92,
    "evidence": [
      "LANÇAMENTOS INTERNACIONAIS",
      "DATA ESTABELECIMENTO VALOR EM R$"
    ]
  }
}

10) Endpoints Recomendados
POST /api/import/scan
  → varre inbox e atualiza fila

GET /api/import/queue
  → lista batches

GET /api/import/batch/:file_hash
  → retorna parseResult

POST /api/import/commit/:file_hash
  → aplica dedupe + grava no banco

11) Front — UX de Validação
Tela: Import Queue

Lista PDFs pendentes

Mostra:

filename

banco detectado

total transações

needsReview

status

Botão: "Scan Inbox"

Botão: "Open / Review"

Tela: Batch Review

Tabela editável:

Data

Descrição

Valor

Direção

Confiança

Destacar needsReview

Botão: "Commit Import"

Fallback (bank = unknown)

Dropdown: “Selecione o banco”

Botão: “Parsear com este parser”

12) Commit no Banco

Para cada transação:

Gerar transaction_fingerprint

Fazer upsert por fingerprint

Se novo:

inserir

salvar:

source_file_hash

source_batch_id

Atualizar batch como imported

Mover PDF para /data/imported

13) Banco de Dados — Tabelas / Collections
imports

file_hash (unique)

filename

bank

status

createdAt

importedAt

import_batches

batch_id

file_hash

bank

status

stats

transactions

transaction_fingerprint (unique)

source_file_hash

source_batch_id

postedAt

description

amount

currency

meta

createdAt

