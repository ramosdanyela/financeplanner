Você vai criar um novo parser (Itaú) mas ele PRECISA seguir o mesmo padrão arquitetural do meu parser Nubank, que já existe e está funcionando em produção.

Antes de escrever qualquer coisa:
1) Me pergunte (somente uma vez) onde está o arquivo do parser Nubank no repo (ex: src/parsers/nubankParser.ts) e quais são os types compartilhados (ex: src/types/ParseResult.ts).
2) Quando eu te passar os arquivos (ou colar o código), você deve:
   - Ler o código
   - Identificar:
     a) assinatura e nomes das funções públicas
     b) formato exato do ParseResult
     c) formato de previewRows
     d) regras de confidence / needsReview
     e) convenção de IDs (como você cria `id`)
     f) como você organiza helpers (groupLines, parseCurrencyBR etc.)
     g) padrão de warnings e erros
     h) estrutura de pastas / exports
3) Em seguida você deve gerar o parser Itaú:
   - Usando os mesmos types (importando os mesmos arquivos)
   - Mesma filosofia de determinismo
   - Mesmo estilo de código e organização
   - Mesma forma de testes (mesmo runner: jest/vitest) e mesma estrutura de pastas de testes
   - Mesmo formato do CLI (se existir)

RESTRIÇÕES:
- NÃO use IA/LLM no runtime.
- NÃO use OCR por padrão.
- Se PDF não tiver texto selecionável, retornar o mesmo erro/handling que o Nubank usa.

RESULTADO:
- Ao final, entregue:
  a) `itauParser.ts` (ou equivalente) no mesmo estilo do Nubank
  b) testes unitários com golden dataset
  c) instruções de execução
  d) qualquer ajuste pequeno necessário em index/export/registry do parser para o app reconhecer o Itaú

IMPORTANTE:
- Não reescreva o Nubank parser.
- Apenas reutilize patterns e types.
