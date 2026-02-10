Agora estenda o parser para suportar um "preview editável" avançado:

Quero adicionar ao ParseResult:

1) fieldMap por transação:
{
  postedAt: "parsed_from_line" | "inferred_from_period" | "manual",
  description: "parsed_from_line" | "continued_wrap" | "manual",
  amount: "parsed_from_value_column" | "parsed_from_value_only_line" | "manual"
}

2) lineDiagnostics:
Para cada transação, um array:
{
  line: string,
  type: "start" | "continuation" | "usd_detail" | "fx_detail" | "value_only" | "ignored"
}

3) previewRows:
Formatar:
- Data: DD/MM
- Valor: "R$ 1.234,56"
- Direction: "Débito" ou "Crédito"

Atualize:
- Código
- Tipos
- Testes
Sem usar IA.
Tudo determinístico.

Esses casos reais quebraram o parser. Aqui está:
- Dump de linhas com text/x0/x1/top/page
- JSON gerado

Tarefa:
1) Identificar exatamente qual heurística falhou
2) Propor ajuste mínimo e determinístico
3) Atualizar o código
4) Adicionar teste unitário cobrindo o novo caso
5) Garantir que o Golden Dataset continua passando

Proibido:
- Introduzir IA
- Introduzir OCR
- Remover validações

