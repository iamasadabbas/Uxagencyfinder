// Visual tokens per industry and deterministic agency monogram colours.
// Adding a new industry? Add an entry here (optional - a neutral fallback is used).

export const industryTheme: Record<string, { color: string; soft: string }> = {
  healthcare: { color: '#be123c', soft: '#fff1f3' },
  fintech: { color: '#047857', soft: '#ecfdf5' },
  ecommerce: { color: '#b45309', soft: '#fffbeb' },
  logistics: { color: '#1d4ed8', soft: '#eff6ff' },
  'real-estate': { color: '#0f766e', soft: '#f0fdfa' },
  education: { color: '#6d28d9', soft: '#f5f3ff' },
  robotics: { color: '#334155', soft: '#f1f5f9' },
  'ai-and-ml': { color: '#4338ca', soft: '#eef2ff' },
};
export const themeFor = (id: string) => industryTheme[id] ?? { color: '#4f46e5', soft: '#eef2ff' };

const palette = [
  ['#4f46e5', '#7c3aed'], ['#0ea5e9', '#2563eb'], ['#10b981', '#0d9488'], ['#f59e0b', '#ea580c'],
  ['#ec4899', '#e11d48'], ['#8b5cf6', '#6366f1'], ['#14b8a6', '#0891b2'], ['#64748b', '#334155'],
];
export function monogram(name: string) {
  const clean = name.replace(/\.agency$/i, '').replace(/[^A-Za-z0-9& ]/g, ' ').trim();
  const words = clean.split(/\s+/).filter((w) => w && w !== '&');
  const initials = words.length > 1 ? words[0][0] + words[1][0] : clean.slice(0, 2);
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const [a, b] = palette[h % palette.length];
  return { initials: initials.toUpperCase(), gradient: `linear-gradient(135deg, ${a}, ${b})` };
}

