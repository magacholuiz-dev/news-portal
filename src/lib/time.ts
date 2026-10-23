/** "23:50" | "1:02:03" | "90" -> segundos. Vazio/ inválido -> null. */
export function parseTimecode(input: unknown): number | null {
  if (typeof input === "number") return Number.isFinite(input) && input >= 0 ? Math.floor(input) : null;
  if (typeof input !== "string") return null;
  const raw = input.trim();
  if (!raw) return null;
  const parts = raw.split(":");
  if (parts.length > 3 || parts.some((p) => !/^\d+$/.test(p.trim()))) return null;
  const nums = parts.map((p) => Number(p.trim()));
  return nums.reduce((acc, n) => acc * 60 + n, 0);
}

/** segundos -> "m:ss" ou "h:mm:ss". null -> "". */
export function formatTimecode(seconds: number | null | undefined): string {
  if (seconds == null) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
}
