export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

export function calculateReadingTime(textOrHtml: string): number {
  if (!textOrHtml) return 1;
  // strip html tags
  const plainText = textOrHtml.replace(/<[^>]*>?/gm, " ");
  const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length;
  // Average reading speed 200 words per minute
  return Math.max(1, Math.ceil(wordCount / 200));
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
