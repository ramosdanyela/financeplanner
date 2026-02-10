Você é um engenheiro full-stack sênior especializado em parsing determinístico de PDFs financeiros.

Quero um parser 100% determinístico (SEM IA/LLM, SEM OCR por padrão) para PDFs de fatura do Itaú Cartões (LATAM PASS / Mastercard Black). Eu já tenho um parser de Nubank funcionando com arquitetura parecida; quero replicar o padrão.

━━━━━━━━━━━━━━━━━━━━━━
OBJETIVO
━━━━━━━━━━━━━━━━━━━━━━
Entrada:
- PDF (buffer) de fatura Itaú com texto selecionável.

Saída:
- ParseResult com transações normalizadas + previewRows para UI editável.
- Sem IA.
- Com testes unitários baseados em um Golden Dataset (abaixo).

━━━━━━━━━━━━━━━━━━━━━━
STACK / LINGUAGEM
━━━━━━━━━━━━━━━━━━━━━━
Use Node.js + TypeScript com `pdfjs-dist`.

Assinatura:
`parseItauCardStatement(buffer: Uint8Array): Promise<ParseResult>`

━━━━━━━━━━━━━━━━━━━━━━
RESTRIÇÕES
━━━━━━━━━━━━━━━━━━━━━━
- NÃO usar IA/LLM.
- NÃO usar OCR por padrão.
- Se não houver texto extraível: retornar erro "SCANNED_PDF_NEEDS_OCR".
- Não depender de bibliotecas de "table extraction" tipo Camelot/Tabula.
- Código modular e testável.

━━━━━━━━━━━━━━━━━━━━━━
FORMATO REAL DA FATURA ITAÚ (DEVE SER SUPORTADO)
━━━━━━━━━━━━━━━━━━━━━━
1) Metadados (na primeira página):
- "Postagem: DD/MM/AAAA"
- "Emissão: DD/MM/AAAA"
- "Vencimento: DD/MM/AAAA"
- "Total desta fatura" e/ou "O total da sua fatura é: R$ X"

2) Seções de lançamentos:
A) "Lançamentos: compras e saques"
- Tabela com cabeçalho: "DATA ESTABELECIMENTO VALOR EM R$"
- Pode aparecer em 1 coluna ou em 2 colunas lado a lado na mesma página.
- A descrição pode quebrar e incluir categoria/localidade na linha abaixo (ex.: "VEÍCULOS .Sao Paulo"), que deve ser anexada à descrição OU armazenada como meta, mas nunca virar transação nova.

B) "Lançamentos internacionais"
- Cabeçalho: "DATA ESTABELECIMENTO US$ R$"
- Linhas incluem:
  - data + merchant + valor em R$ (principal)
  - linha seguinte: cidade + valor US$ + "USD x,xx"
  - linha "Dólar de Conversão R$ x,xx" (NÃO é transação)
- Também aparecem linhas de totais (NÃO são transação):
  - "Total transações inter. em R$ ..."
  - "Repasse de IOF em R$ ..."
  - "Total lançamentos inter. em R$ ..."
  - "Total retiradas exterior em R$ ..."
  - "Total transações inter. em R$ ..."
  => Essas devem ser capturadas como statementTotals (warning/info), mas não virar transações.

C) "Lançamentos: produtos e serviços"
- Cabeçalho: "DATA PRODUTOS/SERVIÇOS VALOR EM R$"
- Ex.: "ANUIDADE ...", "ENCARGOS DE ATRASO ..."

3) Valores BRL:
- Formato pt-BR: "1.234,56", "9,90"
- Geralmente sem "R$" na linha da transação (mas implemente robusto para aceitar "R$ " opcional).
Regex BRL (string inteira):
^-?\s*(R\$\s*)?\d{1,3}(\.\d{3})*,\d{2}$

Parse:
- remove "R$"
- remove espaços
- remove pontos de milhar
- troca vírgula por ponto
- parseFloat
- retornar number

4) Datas nas transações:
- Formato: "DD/MM" (sem ano)
- O ano deve ser inferido pela "Postagem" ou "Emissão" (ex.: Postagem: 16/07/2024).
- Regra: se a transação tem mês > mês da emissão e estamos em janeiro (virada de ano), ajustar ano (ex.: emissão Jan e transação Dez). Faça regra geral para viradas.

━━━━━━━━━━━━━━━━━━━━━━
SAÍDA — JSON SCHEMA (MESMO PADRÃO DO NUBANK)
━━━━━━━━━━━━━━━━━━━━━━
type ParseResult = {
  statement: {
    bank: "itau",
    product?: string,          // ex: "LATAM PASS ITAU MASTERCARD BLACK"
    postedAt?: string,         // ISO yyyy-mm-dd (da "Postagem")
    issuedAt?: string,         // ISO (da "Emissão")
    dueDate?: string,          // ISO (do "Vencimento")
    total?: number,            // Total desta fatura
  },
  transactions: Array<{
    id: string,                 // determinístico: page + rowIndex + section
    postedAt: string | null,    // ISO yyyy-mm-dd
    description: string,
    amount: number | null,      // BRL positivo (absoluto)
    currency: "BRL",
    direction: "debit" | "credit" | "unknown",
    meta?: {
      section?: "purchases_withdrawals" | "international" | "services",
      categoryLine?: string,        // ex: "VEÍCULOS .Sao Paulo"
      originalCurrency?: "USD" | "EUR" | "GBP" | "BRL",
      originalAmount?: number,
      fxRate?: number,              // do "Dólar de Conversão"
      isIofRepasseLine?: boolean     // se você decidir registrar, mas NÃO é transação
    },
    raw: { page: number, lines: string[] },
    confidence: number,
    needsReview: boolean
  }>,
  previewRows: Array<{
    postedAtText: string,       // DD/MM
    descriptionText: string,
    amountText: string,         // "R$ 9,90"
    direction: string,
    page: number,
    confidence: number,
    needsReview: boolean
  }>,
  warnings: Array<{ code: string, message: string }>
}

━━━━━━━━━━━━━━━━━━━━━━
ALGORITMO OBRIGATÓRIO (DETERMINÍSTICO)
━━━━━━━━━━━━━━━━━━━━━━

ETAPA 0 — Extrair itens com coordenadas do pdf.js
- normalize text

ETAPA 1 — Agrupar em linhas visuais
- cluster por y/top com tolerância 2–4px
- ordene por x
- reconstrua string
- armazene também ranges de x para ajudar a detectar colunas

ETAPA 2 — Detectar seções por palavras-chave (por página)
- Ao encontrar "Lançamentos: compras e saques", entrar no modo purchases_withdrawals
- Ao encontrar "Lançamentos internacionais", entrar no modo international
- Ao encontrar "Lançamentos: produtos e serviços", entrar no modo services
- Sair da seção quando encontrar outro cabeçalho relevante ou "Continua..." ou rodapé.

ETAPA 3 — Lidar com duas colunas lado a lado (purchases_withdrawals)
- Na seção purchases_withdrawals, uma página pode conter duas tabelas iguais lado a lado.
- Estratégia determinística:
  - Separe linhas por "centro" da página: se x médio < midX => coluna esquerda, senão coluna direita.
  - Parseie cada coluna como tabela independente.
  - Mescle resultados mantendo ordem por data + posição vertical (top).

ETAPA 4 — Parse de linha de transação (purchases_withdrawals / services)
- Uma transação começa com data "DD/MM" no início da linha:
  regex: ^\d{2}/\d{2}\b
- A mesma linha geralmente contém merchant e valor.
- Linhas seguintes que NÃO começam com data e parecem categoria/local (ex: contém "." e letras) devem ser anexadas como meta.categoryLine e/ou concatenadas na descrição.
- Nunca criar nova transação por causa de linhas de categoria.

ETAPA 5 — Parse de internacional
- Linha principal pode aparecer como:
  "04/07 EXPRESSVPN.COM 75,11"
  (data + merchant + BRL)
- Linhas seguintes podem conter:
  - cidade + valor original + "USD 12,95"
  - linha "Dólar de Conversão R$ 5,80" => extrair fxRate e anexar ao último internacional
- Ignorar linhas que começam com:
  - "Total "
  - "Repasse de IOF"
  - "Total lançamentos"
  - "Total retiradas"
  (registrar em warnings se quiser, mas não virar transação)

ETAPA 6 — Direção
- Neste tipo de fatura, compras normalmente são debit.
- Se a descrição contiver "Pagamento efetuado" ou algo do resumo, NÃO é transação.
- Se houver linhas de estorno (ex: "ESTORNO" ou "CREDITO"), marcar como credit.
- Caso padrão: debit.

ETAPA 7 — Inferir ano e gerar ISO
- Use statement.issuedAt ou statement.postedAt como referência de ano
- Para cada "DD/MM", crie ISO com o ano inferido.
- Regra de virada: se mês da transação for muito maior que mês de emissão e emissão é janeiro/fevereiro, pode ser ano anterior. (implemente lógica segura e deixe needsReview se ambíguo.)

ETAPA 8 — Confidence
confidence = 1.0
- postedAt null: -0.4
- amount null: -0.4
- descrição curta (<4): -0.2
- international sem fxRate: -0.1 (não é crítico)

needsReview = confidence < 0.9 OR postedAt null OR amount null

━━━━━━━━━━━━━━━━━━━━━━
GOLDEN DATASET (TESTES OBRIGATÓRIOS)
━━━━━━━━━━━━━━━━━━━━━━
Você deve escrever testes unitários com estes casos. Use-os como "linhas reconstruídas" (strings) para testar as funções de parsing (não precisa renderizar PDF real no teste).

CASO 1 — Purchase simples
Linha:
"27/06 Uber *UBER *TRIP 9,90"
Esperado:
postedAt: 2024-06-27
description: "Uber *UBER *TRIP"
amount: 9.90
section: purchases_withdrawals
direction: debit

CASO 2 — Purchase com categoria/linha extra
Linhas:
"22/06 Uber *UBER *TRIP 104,96"
"VEÍCULOS .Sao Paulo"
Esperado:
description: "Uber *UBER *TRIP"
meta.categoryLine: "VEÍCULOS .Sao Paulo"
amount: 104.96

CASO 3 — Linha que NÃO é transação (ignorar)
Linha:
"Lançamentos no cartão (final 6208) 1.573,43"
Esperado:
não gera transação

CASO 4 — International completo (BRL + USD + FX)
Linhas:
"04/07 EXPRESSVPN.COM 75,11"
"WILMINGTON 12,95 USD 12,95"
"Dólar de Conversão R$ 5,80"
Esperado:
amount: 75.11
meta.originalCurrency: "USD"
meta.originalAmount: 12.95
meta.fxRate: 5.80
section: international

CASO 5 — Ignorar totais internacionais
Linhas:
"Total transações inter. em R$ 2.977,65"
"Repasse de IOF em R$ 130,54"
"Total lançamentos inter. em R$ 3.329,47"
Esperado:
não gera transações; (opcional) warnings adicionados

CASO 6 — Services (anuidade)
Linhas:
"16/06 ANUIDADE DIFERENCI06/12 100,00"
Titular line:
"Titular 6208"
Esperado:
description: "ANUIDADE DIFERENCI06/12"
amount: 100.00
section: services
linha "Titular 6208" não cria transação

CASO 7 — Services (encargos atraso)
Linha:
"15/07 ENCARGOS DE ATRASO 42,53"
Esperado:
amount 42.53
section services

CASO 8 — Purchase em duas colunas (simulação)
Você deve testar a função de split por coluna:
- Dado um conjunto de lineItems com x médio < midX e > midX, garantir que são parseados como duas tabelas e unidos.
(Use um mock simples de estrutura com x positions.)

━━━━━━━━━━━━━━━━━━━━━━
GOLDEN RESPONSES (EXPECTED OUTPUTS)
━━━━━━━━━━━━━━━━━━━━━━
Para os casos 1,2,4,6,7 retorne também snapshots de JSON esperado (como objetos literais no teste), para garantir estabilidade.

━━━━━━━━━━━━━━━━━━━━━━
DELIVERABLES
━━━━━━━━━━━━━━━━━━━━━━
1) `itauParser.ts` com:
   - parseItauCardStatement(buffer)
   - extractTextItemsPdfjs
   - groupLines
   - detectSections
   - splitIntoColumnsIfNeeded
   - parsePurchasesLines
   - parseInternationalLines
   - parseServicesLines
   - parseCurrencyBR
   - parseOriginalCurrencyLine
   - parseFxRateLine
   - inferYearAndIsoDate

2) Testes:
   - Vitest ou Jest (escolha um e configure)
   - cobrindo TODO o Golden Dataset

3) CLI:
   `node parse-itau.js path/to/file.pdf` imprime JSON

4) Instruções de execução.

CRITÉRIO DE SUCESSO:
- Testes passam
- Parser ignora totais e cabeçalhos
- Parser captura internacional com meta
- Parser suporta 2 colunas lado a lado
- Sem IA
