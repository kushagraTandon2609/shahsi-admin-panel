import { TrendingUp } from 'lucide-react';
import { Card } from './Card';

type StatCardProps = {
  title: string;
  value: string | number;
  description?: string;
};

export function StatCard({ title, value, description }: StatCardProps) {
  return (
    <Card className="group overflow-hidden p-0">
      <div className="relative px-5 py-5">
        <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-50 text-gray-400 transition group-hover:bg-black group-hover:text-white">
          <TrendingUp size={18} />
        </div>

        <p className="pr-12 text-sm font-semibold text-gray-500">{title}</p>

        <h3 className="mt-3 text-3xl font-bold tracking-tight text-gray-950">
          {value}
        </h3>

        {description ? (
          <p className="mt-2 text-xs leading-5 text-gray-500">{description}</p>
        ) : (
          <p className="mt-2 text-xs leading-5 text-gray-400">
            Live admin API data
          </p>
        )}
      </div>

      <div className="h-1 w-full bg-gradient-to-r from-black via-gray-400 to-gray-100" />
    </Card>
  );
}