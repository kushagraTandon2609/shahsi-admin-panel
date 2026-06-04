import { Card } from './Card';

type ApiPendingStateProps = {
  title?: string;
  description?: string;
};

export function ApiPendingState({
  title = 'API Pending',
  description = 'Ye page frontend me ready hai, backend API banne ke baad connect hoga.',
}: ApiPendingStateProps) {
  return (
    <Card className="border-dashed text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
    </Card>
  );
}