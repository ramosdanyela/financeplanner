14) Prompt para Claude — Implementar BankDetector

Implemente um BankDetector determinístico.

Função:
detectBank(textSample: string): DetectResult

Requisitos:
- Suportar: nubank, itau, bradesco, unknown
- Sistema de score com pesos
- Retornar evidence (palavras-chave encontradas)
- Se score < 0.6 → unknown
- Se diferença top1-top2 < 0.15 → unknown

Inclua testes unitários para:
- Sample Nubank (TRANSAÇÕES DE)
- Sample Itaú (LANÇAMENTOS INTERNACIONAIS, DATA ESTABELECIMENTO VALOR EM R$)
- Sample Bradesco (BRADESCO)
- Sample ambíguo → unknown

15) Prompt para Claude — Implementar Scanner
Implemente o scanner de inbox:

- Varre /data/pdf_inbox
- Gera file_hash
- Detecta banco
- Chama parser correto
- Gera ImportBatch
- Salva JSON no parsed_cache e import_queue
- Move arquivos para imported ou failed conforme resultado

Implemente como:
- CLI (node scan-inbox.js)
- E função reaproveitável para endpoint API
Inclua testes para:
- PDF duplicado
- PDF unknown bank
- PDF parseado com sucesso

16) Prompt para Claude — Implementar Dedupe
Implemente:

function makeTransactionFingerprint(tx)

Regras:
- Use sha256
- Normalize descrição
- Converta amount para centavos
- Banco de dados deve ter índice único

Inclua testes:
- Mesma transação em dois PDFs → 1 insert
- Descrição levemente diferente → fingerprints diferentes



