Você é um engenheiro full-stack sênior especializado em parsing de documentos financeiros.

Quero um parser 100% determinístico (SEM IA, SEM LLM, SEM OCR por padrão) para PDFs de fatura do Nubank (Brasil). Esses PDFs NÃO são tabelas puras — têm layout visual em colunas, quebras de linha, blocos de compra internacional, IOF, valores com e sem "R$", e pagamentos às vezes positivos, às vezes negativos.

Eu vou criar um parser específico por banco, então você pode assumir layout Nubank e aplicar heurísticas hard-coded, mas explicáveis e testáveis.

━━━━━━━━━━━━━━━━━━━━━━
OBJETIVO
━━━━━━━━━━━━━━━━━━━━━━
Entrada:
- PDF (buffer/arquivo) OU preferencialmente uma extração de texto com coordenadas (x/y) por página.

Saída:
- JSON normalizado de transações
- "previewRows" para UI editável
- avisos e score de confiança por transação

━━━━━━━━━━━━━━━━━━━━━━
STACK / LINGUAGEM
━━━━━━━━━━━━━━━━━━━━━━
Escolha UMA e implemente completo:

Opção A (recomendada):
Node.js + TypeScript usando `pdfjs-dist`
Função:
`parseNubankStatement(buffer: Uint8Array): Promise<ParseResult>`

Opção B:
Python usando `pdfplumber`
Função:
`parse_nubank_statement(pdf_path: str) -> ParseResult`

Escolha apenas uma e siga até o fim.

━━━━━━━━━━━━━━━━━━━━━━
RESTRIÇÕES
━━━━━━━━━━━━━━━━━━━━━━
- NÃO usar LLM, IA ou heurísticas probabilísticas.
- NÃO usar OCR por padrão.
- Se não houver texto extraível do PDF, retornar erro:
  "SCANNED_PDF_NEEDS_OCR"
- Código precisa ser:
  - modular
  - testável
  - explicável
  - com testes unitários reais

━━━━━━━━━━━━━━━━━━━━━━
DEFINIÇÃO DE TEXTO COM COORDENADAS
━━━━━━━━━━━━━━━━━━━━━━
Cada item de texto deve ter:
{
  text: string,
  x0: number,
  x1: number,
  top: number,
  bottom: number,
  page: number
}

pdf.js:
- Use `page.getTextContent()`
- Derive x/y a partir do `transform`

pdfplumber:
- Use `page.extract_words(use_text_flow=False, keep_blank_chars=False)`

━━━━━━━━━━━━━━━━━━━━━━
LAYOUT NUBANK (REGRAS REAIS)
━━━━━━━━━━━━━━━━━━━━━━
COLUNAS VISUAIS:
- Esquerda: Data no formato `DD MMM` (PT-BR, ex: 20 NOV, 01 DEZ, 15 JAN)
- Centro: Descrição (pode quebrar em múltiplas linhas)
- Direita: Valor em BRL

FORMATO DE VALOR BRL:
- Pode ter ou não "R$"
- Pode ser negativo ou positivo
Exemplos válidos:
- 11,98
- R$ 27,90
- -R$ 1.261,96
- 1.698,33

Regex BRL (string inteira):
^-?\s*(R\$\s*)?\d{1,3}(\.\d{3})*,\d{2}$

Normalização:
- Remover "R$"
- Remover espaços
- Remover pontos de milhar
- Trocar vírgula por ponto
- parseFloat
- Gerar:
  - amountAbs (valor absoluto)
  - signedAmount (com sinal, opcional mas recomendado)

━━━━━━━━━━━━━━━━━━━━━━
INTERNACIONAL (USD)
━━━━━━━━━━━━━━━━━━━━━━
Compra internacional aparece como bloco:
Linha 1: descrição normal
Linha 2: "USD 26,53" OU "USD 20.00"
Linha 3: "Conversão: USD 1 = R$ 5,08"
Linha 4: valor BRL final (às vezes só "R$ 116,68")

Regex USD:
^USD\s+(\d+(?:[.,]\d{2})?)$

- Aceite ponto OU vírgula
- Normalize vírgula para ponto antes do parseFloat

━━━━━━━━━━━━━━━━━━━━━━
IOF
━━━━━━━━━━━━━━━━━━━━━━
Linha:
"IOF de <descrição> R$ x,xx"

Isso é uma TRANSAÇÃO SEPARADA.
Se descrição começar com "IOF de":
- meta.type = "fee_iof"

━━━━━━━━━━━━━━━━━━━━━━
DELIMITAÇÃO DE SEÇÃO
━━━━━━━━━━━━━━━━━━━━━━
- Só parsear após encontrar:
  "TRANSAÇÕES DE"
- Ignorar cabeçalhos, rodapés e seções fora desse bloco
- Fallback:
  Se não encontrar o título, parsear linhas que começam com `DD MMM`

━━━━━━━━━━━━━━━━━━━━━━
SAÍDA — JSON SCHEMA
━━━━━━━━━━━━━━━━━━━━━━
type ParseResult = {
  statement: {
    bank: "nubank",
    dueDate?: string, // ISO yyyy-mm-dd
    period?: {
      start: string, // ISO
      end: string    // ISO
    }
  },
  transactions: Array<{
    id: string,
    postedAt: string | null,
    description: string,
    amount: number | null,     // valor absoluto em BRL
    signedAmount?: number,    // opcional, com sinal
    currency: "BRL",
    direction: "debit" | "credit" | "unknown",
    meta?: {
      originalCurrency?: "USD",
      originalAmount?: number,
      fxRate?: number,
      type?: "fee_iof"
    },
    raw: {
      page: number,
      lines: string[]
    },
    confidence: number,   // 0..1
    needsReview: boolean
  }>,
  previewRows: Array<{
    postedAtText: string,
    descriptionText: string,
    amountText: string,
    direction: string,
    page: number,
    confidence: number,
    needsReview: boolean
  }>,
  warnings: Array<{
    code: string,
    message: string
  }>
}

━━━━━━━━━━━━━━━━━━━━━━
ALGORITMO OBRIGATÓRIO
━━━━━━━━━━━━━━━━━━━━━━

ETAPA 0 — EXTRAÇÃO
- Extrair itens de texto com coordenadas
- Normalizar espaços
- Remover vazios

ETAPA 1 — LINHAS VISUAIS
- Agrupar por `top` (tolerância 2–4px)
- Ordenar por `x0`
- Reconstruir texto com espaços se houver gaps grandes

ETAPA 2 — COLUNAS
- Detectar largura da página
- Definir colunas por percentil:
  - Data: x < P15
  - Valor: x > P85
  - Descrição: resto

ETAPA 3 — INÍCIO DE TRANSAÇÃO
Nova transação se:
- Coluna de data casa com:
  ^\d{2}\s+[A-ZÇ]{3}

Caso contrário:
- Se linha contém "USD" ou "Conversão:" → bloco internacional da transação anterior
- Se linha contém apenas valor BRL → valor da transação anterior
- Senão → continuação da descrição da transação anterior

ETAPA 4 — VALOR
- Procurar primeiro na coluna de valor
- Fallback: token mais à direita da linha
- Se não achar, aguardar próxima linha (value-only line)

ETAPA 5 — INTERNACIONAL
- Extrair originalAmount da linha USD
- Extrair fxRate da linha Conversão
- Valor final vem da linha BRL

ETAPA 6 — DIREÇÃO
- Se signedAmount < 0 → credit
- OU se descrição contém "Pagamento" ou "Estorno" → credit
- Senão → debit
- Se amount null → unknown

ETAPA 7 — DATAS
- Inferir ano a partir de:
  - "Vencimento" no PDF, OU
  - período "TRANSAÇÕES DE XX MMM A XX MMM"
- Converter para ISO yyyy-mm-dd
- Se falhar → postedAt null

ETAPA 8 — CONFIANÇA
confidence = 1.0
- postedAt null → -0.4
- amount null → -0.4
- descrição < 4 caracteres → -0.2
- USD sem fxRate → -0.2

needsReview = confidence < 0.9 OR postedAt null OR amount null

━━━━━━━━━━━━━━━━━━━━━━
GOLDEN DATASET (TESTES OBRIGATÓRIOS)
━━━━━━━━━━━━━━━━━━━━━━
Implemente testes unitários que passem com ESTES CASOS:

CASO 1 — Simples
Linha:
20 JAN Uber *Uber *Trip 11,98
Esperado:
postedAt: 2023-01-20
description: "Uber *Uber *Trip"
amount: 11.98
direction: debit

CASO 2 — Descrição quebrada
Linhas:
22 NOV Spotify Premium
Mensal 19,90
Esperado:
description: "Spotify Premium Mensal"
amount: 19.90

CASO 3 — Internacional completo
Linhas:
22 NOV Miro.Com
USD 26,53
Conversão: USD 1 = R$ 5,08
134,66
Esperado:
amount: 134.66
meta.originalCurrency: USD
meta.originalAmount: 26.53
meta.fxRate: 5.08

CASO 4 — Internacional com ponto
Linhas:
10 SET Openai *Chatgpt Subscr
USD 20.00
Conversão: USD 1 = R$ 5,83
R$ 116,68
Esperado:
amount: 116.68
meta.originalAmount: 20.00
meta.fxRate: 5.83

CASO 5 — Pagamento positivo
Linha:
27 JAN Pagamento em 27 JAN 8.265,58
Esperado:
direction: credit
amount: 8265.58

CASO 6 — Pagamento negativo
Linha:
20 AGO Pagamento em 20 AGO -R$ 1.261,96
Esperado:
direction: credit
signedAmount: -1261.96
amount: 1261.96

CASO 7 — IOF separado
Linha:
IOF de "Openai *Chatgpt Subscr" R$ 5,11
Esperado:
meta.type = "fee_iof"
amount: 5.11

CASO 8 — Valor na linha de baixo
Linhas:
05 FEV Amazon BR
199,99
Esperado:
amount: 199.99

━━━━━━━━━━━━━━━━━━━━━━
DELIVERABLES
━━━━━━━━━━━━━━━━━━━━━━
1) Código completo do parser
2) Funções auxiliares:
   - groupLines
   - detectColumns
   - isTransactionStart
   - parseCurrencyBR
   - parseUSD
   - inferYear
3) Testes unitários cobrindo TODO o Golden Dataset
4) Script CLI de exemplo que recebe PDF e imprime JSON
5) Instruções de como rodar

━━━━━━━━━━━━━━━━━━━━━━
CRITÉRIO DE SUCESSO
━━━━━━━━━━━━━━━━━━━━━━
- Todos os testes passam
- Parser funciona sem IA
- Código legível e modular
- Fácil de debugar e estender para outros bancos
