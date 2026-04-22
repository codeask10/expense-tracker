export const CATEGORY_CONFIG: Record<string, { color: string; bg: string; text: string; border: string }> = {
  Food:           { color: '#ef4444', bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-200' },
  Transportation: { color: '#14b8a6', bg: 'bg-teal-50',   text: 'text-teal-600',   border: 'border-teal-200' },
  Transport:      { color: '#14b8a6', bg: 'bg-teal-50',   text: 'text-teal-600',   border: 'border-teal-200' },
  Entertainment:  { color: '#3b82f6', bg: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-200' },
  Shopping:       { color: '#22c55e', bg: 'bg-green-50',  text: 'text-green-600',  border: 'border-green-200' },
  Health:         { color: '#a855f7', bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
  Healthcare:     { color: '#a855f7', bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
  Utilities:      { color: '#eab308', bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' },
  Housing:        { color: '#8b5cf6', bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200' },
  Education:      { color: '#06b6d4', bg: 'bg-cyan-50',   text: 'text-cyan-600',   border: 'border-cyan-200' },
  Other:          { color: '#6b7280', bg: 'bg-gray-50',   text: 'text-gray-600',   border: 'border-gray-200' },
};

export function getCategoryConfig(cat: string) {
  return CATEGORY_CONFIG[cat] ?? CATEGORY_CONFIG['Other'];
}
