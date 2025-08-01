"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorMessage({ error, onRetry }: { error?: Error; onRetry?: () => void }) {
  return (
    <div className="flex justify-start text-destructive">
      <div className="rounded-2xl border border-destructive p-4">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="font-semibold">Error</div>
            <div className="text-sm mt-1">
              {error?.message ||
                "We encountered an error while processing your request. Please try again."}
            </div>
            {onRetry && (
              <div className="flex justify-end">
                <RetryButton onRetry={onRetry} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RetryButton({ onRetry }: { onRetry: () => void }) {
  return (
    <Button
      size="sm"
      onClick={onRetry}
      className="mt-3 inline-flex items-center text-sm cursor-pointer"
    >
      <RefreshCw className="h-4 w-4" />
      <span>Try again</span>
    </Button>
  );
}
