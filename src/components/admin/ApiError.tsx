import { AlertTriangle, XCircle } from 'lucide-react';

type ApiErrorProps = {
  message?: string;
};

export function ApiError({ message }: ApiErrorProps) {
  if (!message) return null;

  return (
    <div className="mb-5 overflow-hidden rounded-2xl border border-red-200 bg-red-50 shadow-sm">
      <div className="flex items-start gap-3 px-4 py-4">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700">
          <AlertTriangle size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-red-800">
              Backend request failed
            </p>

            <XCircle size={14} className="text-red-500" />
          </div>

          <p className="mt-1 break-words text-sm leading-6 text-red-700">
            {message}
          </p>

          <p className="mt-2 text-xs text-red-500">
            Check the API payload or backend DTO validation if this is a 400 error.
          </p>
        </div>
      </div>
    </div>
  );
}