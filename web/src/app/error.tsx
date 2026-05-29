"use client";

import { useEffect } from "react";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <h2 className="text-2xl font-semibold tracking-tight">문제가 발생했어요</h2>
      <p className="mt-3 max-w-md text-sm text-muted">
        페이지를 표시하는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.
      </p>
      {error?.digest && (
        <p className="mt-2 text-xs text-muted">Error ID: {error.digest}</p>
      )}
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 rounded-full bg-charcoal px-5 py-2 text-sm font-medium text-white dark:bg-gold dark:text-charcoal"
      >
        다시 시도
      </button>
    </div>
  );
}
