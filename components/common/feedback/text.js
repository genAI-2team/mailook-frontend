export function periodLines(text) {
  if (!text) return null;
  const parts = String(text)
    .split(/(?<=\.)\s+/)
    .filter(Boolean);
  if (parts.length <= 1) return text;
  return parts.map((part, index) => (
    <span key={`${part}-${index}`} className="block">
      {part}
    </span>
  ));
}
