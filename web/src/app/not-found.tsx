import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">404</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight">페이지를 찾을 수 없습니다</h2>
      <p className="mt-3 max-w-md text-sm text-muted">
        요청하신 주소가 변경되었거나 존재하지 않을 수 있습니다.
      </p>
      <Link
        href="/lotus-india"
        className="mt-6 rounded-full bg-charcoal px-5 py-2 text-sm font-medium text-white dark:bg-gold dark:text-charcoal"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
