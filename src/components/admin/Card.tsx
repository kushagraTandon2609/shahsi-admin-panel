import clsx from 'clsx';

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  return (
    <section
      className={clsx(
        'rounded-2xl border border-gray-200 bg-white p-5 shadow-sm',
        'transition-all duration-200',
        'hover:border-gray-300 hover:shadow-md',
        className,
      )}
    >
      {children}
    </section>
  );
}