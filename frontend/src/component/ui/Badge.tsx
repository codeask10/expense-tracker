import { getCategoryConfig } from '../../utils/category';

interface BadgeProps {
  category: string;
  size?: 'sm' | 'md';
}

export function Badge({ category, size = 'sm' }: BadgeProps) {
  const cfg = getCategoryConfig(category);
  const sizeClass = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  return (
    <span className={`inline-flex items-center rounded-full font-medium border ${sizeClass} ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {category}
    </span>
  );
}
