# Lotus Korean Hotel

한국인 게스트용 숙박 시설 웹 프로젝트입니다. 제품 명세는 루트의 `DEVELOPMENT_PROMPT.md`를 참고하세요.

## 구현 위치

애플리케이션 소스는 **`web/`** 디렉터리에 있습니다.

```bash
cd web
npm install
npx prisma db push
npx tsx prisma/seed.ts
npm run dev
```

자세한 실행 방법은 `web/README.md`를 읽으세요.

## MVS

객실·예약 동기화는 `D:\Software Project\MVS`와의 서버 간 연동을 전제로 하며, Lotus 쪽 스텁은 `web/src/lib/mvs.ts`에 있습니다. **회사(테넌트)마다** `mvsCompanyId`가 다르고, 공개 URL은 `/lotus-gangnam` 등 **테넌트 slug 경로**로 분리됩니다.
