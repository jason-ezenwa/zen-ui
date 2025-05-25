import { AlertTriangle } from "lucide-react";

interface AlertBannerProps {
  message: string;
}

export function AlertBanner({ message }: AlertBannerProps) {
  return (
    <div className="mb-6 flex items-center gap-3 rounded-lg bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
      <AlertTriangle className="h-5 w-5" />
      <p>{message}</p>
    </div>
  );
}
