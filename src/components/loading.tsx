import { Loader2 } from "lucide-react";

export function Loading() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center">
      <Loader2 className="animate-spin" />
    </div>
  );
}
