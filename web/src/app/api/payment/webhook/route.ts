import { NextResponse } from "next/server";

/**
 * PG 웹훅 수신 스텁. 실제 연동 시 서명 검증 후 Reservation/Payment 상태를 갱신합니다.
 */
export async function POST(req: Request) {
  const text = await req.text();
  console.info("[payment webhook stub]", text.slice(0, 500));
  return NextResponse.json({ received: true });
}
