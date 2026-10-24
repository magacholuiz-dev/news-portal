/** "Sudão do Sul, México; Ucrânia" -> ["Sudão do Sul", "México", "Ucrânia"].
 * Aceita vírgula, ponto e vírgula, barra ou quebra de linha como separador
 * e remove repetidos. */
export function splitPlaces(text: string | null | undefined): string[] {
  if (!text) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of text.split(/[,;/\n]+/)) {
    const place = part.trim();
    const key = place.toLowerCase();
    if (place && !seen.has(key)) {
      seen.add(key);
      out.push(place);
    }
  }
  return out;
}
