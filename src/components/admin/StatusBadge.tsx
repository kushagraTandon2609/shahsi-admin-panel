import clsx from 'clsx';

type StatusBadgeProps = {
  status?: string;
};

export function StatusBadge({ status = 'UNKNOWN' }: StatusBadgeProps) {
  const value = String(status || 'UNKNOWN').toUpperCase();

  const good = ['ACTIVE', 'PUBLISHED', 'APPROVED', 'SUCCESS', 'COMPLETED', 'PAID'].includes(value);
  const warning = ['PENDING', 'DRAFT', 'PARTIAL', 'PROCESSING', 'LOW_STOCK'].includes(value);
  const bad = ['REJECTED', 'FAILED', 'INACTIVE', 'DELETED', 'CANCELLED', 'OUT_OF_STOCK'].includes(value);

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide',
        good && 'border-green-200 bg-green-50 text-green-700',
        warning && 'border-yellow-200 bg-yellow-50 text-yellow-700',
        bad && 'border-red-200 bg-red-50 text-red-700',
        !good && !warning && !bad && 'border-gray-200 bg-gray-50 text-gray-600',
      )}
    >
      <span
        className={clsx(
          'h-1.5 w-1.5 rounded-full',
          good && 'bg-green-500',
          warning && 'bg-yellow-500',
          bad && 'bg-red-500',
          !good && !warning && !bad && 'bg-gray-400',
        )}
      />
      {value.replace(/_/g, ' ')}
    </span>
  );
}