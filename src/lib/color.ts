/** Converts a #rrggbb hex color to a "H S% L%" string matching this app's
 *  Tailwind CSS variable convention (e.g. "217 91% 60%"). */
export function hexToHslString(hex: string): string | null {
  const match = /^#?([a-f\d]{6})$/i.exec(hex.trim());
  if (!match) return null;

  const hexPart = match[1];
  if (!hexPart) return null;
  const int = parseInt(hexPart, 16);
  const r = ((int >> 16) & 255) / 255;
  const g = ((int >> 8) & 255) / 255;
  const b = (int & 255) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) return `0 0% ${Math.round(l * 100)}%`;

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h = 0;
  switch (max) {
    case r:
      h = (g - b) / d + (g < b ? 6 : 0);
      break;
    case g:
      h = (b - r) / d + 2;
      break;
    default:
      h = (r - g) / d + 4;
  }
  h *= 60;

  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
