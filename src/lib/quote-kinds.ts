export type QuoteKind =
  | "FALA"
  | "COBERTURA"
  | "PODCAST"
  | "QUEM_ESTEVE_LA"
  | "CAPITULO";

export const QUOTE_KINDS: {
  value: QuoteKind;
  label: string;
  help: string;
  scope: "location" | "continent";
}[] = [
  {
    value: "FALA",
    label: "A fala (destaque da reportagem)",
    help: "Aspas grandes com a foto do jornalista, no topo da reportagem do território.",
    scope: "location",
  },
  {
    value: "COBERTURA",
    label: "Como é cobrir aqui",
    help: "Fala curta que acompanha o infográfico de acesso e risco.",
    scope: "location",
  },
  {
    value: "PODCAST",
    label: "Mini podcast (áudio)",
    help: "Áudio de 30 s a 1 min que não entrou nos vídeos; de 3 a 5 por reportagem.",
    scope: "location",
  },
  {
    value: "QUEM_ESTEVE_LA",
    label: "Quem esteve lá (cartão da Análise de dados)",
    help: "Aspa curta + áudio de ~15 s no cartão do território; também aparece no modo comparação do Explorar.",
    scope: "location",
  },
  {
    value: "CAPITULO",
    label: "Aspa do capítulo (continente)",
    help: "Aspa grande do capítulo do continente, com foto e botão do vídeo. Sem jornalista, vira o quadro de aspas vazio.",
    scope: "continent",
  },
];

export function quoteKindLabel(kind: string) {
  return QUOTE_KINDS.find((k) => k.value === kind)?.label ?? kind;
}

export function isQuoteKind(value: unknown): value is QuoteKind {
  return QUOTE_KINDS.some((k) => k.value === value);
}
