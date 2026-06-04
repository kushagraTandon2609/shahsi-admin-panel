import clsx from 'clsx';
import { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export function Input({
  label,
  hint,
  error,
  className,
  id,
  value,
  type = 'text',
  onChange,
  ...props
}: InputProps) {
  const inputId =
    id ||
    (label
      ? label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
      : undefined);

  const normalizedValue =
    type === 'file'
      ? undefined
      : value === undefined || value === null
        ? ''
        : value;

  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-semibold text-gray-800">
          {label}
        </span>
      )}

      <input
        {...props}
        id={inputId}
        type={type}
        value={normalizedValue}
        onChange={onChange}
        className={clsx(
          'h-10 w-full rounded-xl border bg-white px-3 text-sm text-gray-950 shadow-sm',
          'placeholder:text-gray-400',
          'transition-all duration-200',
          'focus:border-black focus:outline-none focus:ring-4 focus:ring-black/10',
          'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
          error
            ? 'border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-red-500/10'
            : 'border-gray-200 hover:border-gray-300',
          className,
        )}
      />

      {error ? (
        <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-gray-500">{hint}</p>
      ) : null}
    </label>
  );
}