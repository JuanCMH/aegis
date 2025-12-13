export function normalizePdfText(raw: string[]): string {
  // Unir todas las páginas
  let text = raw.join("\n");

  // Quitar caracteres invisibles
  text = text.replace(/[\t\f\r]/g, "");

  // Reemplazar saltos de línea seguidos por uno solo
  text = text.replace(/\n{2,}/g, "\n");

  // Remover espacios múltiples
  text = text.replace(/ {2,}/g, " ");

  // Unificar encoding
  text = text.normalize("NFKC");

  // Quitar encabezados/pies repetidos típicos
  text = text.replace(/Pag\. \d+ de \d+/gi, "");

  return text.trim();
}
