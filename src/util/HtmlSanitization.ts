import * as SanitizeHtml from "sanitize-html";

export function sanitizeForDisplay(html: string) {
  return SanitizeHtml(html);
}
