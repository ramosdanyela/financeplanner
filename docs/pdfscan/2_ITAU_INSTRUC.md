Agora estenda o parser do Itaú para devolver diagnósticos para UI editável.

Adicione no ParseResult:

1) fieldMap por transação:
{
  postedAt: "parsed_from_line" | "inferred_from_statement",
  description: "parsed_from_line" | "continued_wrap" | "from_category_line",
  amount: "parsed_from_line" | "parsed_from_value_column"
  fxRate: "parsed_from_line" | "missing"
}

2) lineDiagnostics:
Para cada transação:
[
  { line: string, type: "start" | "category" | "usd_detail" | "fx_detail" | "ignored_total" | "ignored_header" }
]

3) previewRows:
- Data: DD/MM
- Valor: "R$ 1.234,56"
- Direção: "Débito" / "Crédito"
- Exibir badge "International" quando section=international

Atualize:
- tipos
- código
- testes (inclua asserts de lineDiagnostics nos casos 2,4,5,6).
Sem IA.
