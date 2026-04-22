import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingMap = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' };

export function Card({ children, padding = 'md', className = '', ...rest }: CardProps) {
  return (
    <div
      className={`rounded-xl bg-white border border-gray-200 shadow-sm ${paddingMap[padding]} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
