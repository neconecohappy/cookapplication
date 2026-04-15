/**
 * Claude のレスポンスから安全に JSON をパースする
 * - ```json ... ``` のフェンスを除去
 * - 先頭/末尾の余分なテキストを除去
 * - パース失敗時は null を返す（例外は投げない）
 */
export function safeParseJSON<T>(text: string): T | null {
  if (!text) return null;

  let cleaned = text
    .replace(/^```(?:json)?\s*\n?/gm, "")
    .replace(/\n?```\s*$/gm, "")
    .trim();

  const jsonStart = cleaned.search(/[{\[]/);
  const lastBrace = cleaned.lastIndexOf("}");
  const lastBracket = cleaned.lastIndexOf("]");
  const jsonEnd = Math.max(lastBrace, lastBracket);

  if (jsonStart === -1 || jsonEnd === -1 || jsonEnd < jsonStart) return null;

  cleaned = cleaned.slice(jsonStart, jsonEnd + 1);

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
}
