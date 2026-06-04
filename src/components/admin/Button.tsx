import clsx from 'clsx';
import { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
};

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={clsx(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold',
        'transition-all duration-200',
        'focus:outline-none focus:ring-4 focus:ring-black/10',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'active:translate-y-px',

        size === 'sm' && 'h-8 px-3 text-xs',
        size === 'md' && 'h-10 px-4 text-sm',
        size === 'lg' && 'h-11 px-5 text-sm',

        variant === 'primary' &&
          'bg-black text-white shadow-sm hover:bg-gray-800 hover:shadow-md',

        variant === 'secondary' &&
          'border border-gray-200 bg-white text-gray-900 shadow-sm hover:border-gray-300 hover:bg-gray-50 hover:shadow-md',

        variant === 'danger' &&
          'bg-red-600 text-white shadow-sm hover:bg-red-700 hover:shadow-md focus:ring-red-500/20',

        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}