export const HANSIK_MENU_KEY = "hansikMenu";

export type HansikMenuItem = { name: string; price: string };

export type HansikMenuSection = {
  index: string;
  title: string;
  items: HansikMenuItem[];
  wide?: boolean;
};

export const HANSIK_MENU_NOTE =
  "가격은 인도 루피(INR) 기준이며, GST는 별도입니다.";

export const HANSIK_MENU: HansikMenuSection[] = [
  {
    index: "01",
    title: "BBQ",
    items: [
      { name: "삼겹살", price: "1000" },
      { name: "양념 돼지갈비 구이", price: "1200" },
      { name: "장어 구이", price: "1000" },
    ],
  },
  {
    index: "02",
    title: "찜류",
    items: [
      { name: "소갈비찜", price: "800" },
      { name: "돼지갈비찜", price: "800" },
      { name: "김치찜(돼지고기/닭고기)", price: "800" },
      { name: "모둠 해물찜", price: "소 1200 / 대 1800" },
    ],
  },
  {
    index: "03",
    title: "찌개류",
    items: [
      { name: "김치찌개", price: "700" },
      { name: "김치만두찌개", price: "800" },
      { name: "된장찌개", price: "700" },
      { name: "누룽지 + 된장찌개", price: "800" },
      { name: "해물된장찌개", price: "800" },
      { name: "꽃게탕", price: "900" },
      { name: "비지찌개", price: "700" },
      { name: "순두부찌개", price: "700" },
    ],
  },
  {
    index: "04",
    title: "탕류",
    items: [
      { name: "돼지국밥", price: "800" },
      { name: "갈비탕", price: "700" },
      { name: "육개장", price: "700" },
      { name: "설렁탕", price: "700" },
      { name: "백숙(2인분·사전 예약)", price: "1000" },
      { name: "삼계탕(2인분·사전 예약)", price: "1200" },
      { name: "감자탕(2인분·사전 예약)", price: "700" },
    ],
  },
  {
    index: "05",
    title: "일품요리",
    wide: true,
    items: [
      { name: "골뱅이소면 무침", price: "1200" },
      { name: "소고기 불고기", price: "900" },
      { name: "돼지 불고기", price: "800" },
      { name: "두부김치", price: "800" },
      { name: "닭고기 탕수육", price: "700" },
      { name: "제육볶음", price: "700" },
      { name: "오징어볶음", price: "700" },
      { name: "오삼불고기", price: "700" },
      { name: "깐쇼새우", price: "700" },
      { name: "새우마요네즈", price: "700" },
      { name: "새우튀김 (6개)", price: "600" },
      { name: "버터새우", price: "1000" },
      { name: "닭똥집", price: "500" },
      { name: "프라이드치킨", price: "반 마리 600 / 한 마리 900" },
      { name: "양념 치킨", price: "반 마리 700 / 한 마리 1000" },
      { name: "반반 치킨", price: "1000" },
      { name: "치킨윙 (6조각)", price: "500" },
      { name: "안동찜닭(2인분·사전 예약)", price: "800" },
      { name: "닭발(2인분·사전 예약)", price: "1200" },
      { name: "군만두 (야채/김치/고기)", price: "300 / 400 / 400" },
      { name: "감자전", price: "600" },
      { name: "김치전", price: "600" },
      { name: "해물파전", price: "900" },
      { name: "참치회", price: "2000" },
      { name: "연어회", price: "2500" },
      { name: "참치+연어회", price: "2500" },
    ],
  },
  {
    index: "06",
    title: "면류",
    items: [
      { name: "해물짬뽕", price: "700" },
      { name: "새우탕 수제비", price: "700" },
      { name: "잡채", price: "600" },
      { name: "잔치국수", price: "600" },
      { name: "짜장면", price: "600" },
      { name: "간짜장", price: "800" },
      { name: "비빔국수", price: "700" },
      { name: "서리태 콩국수", price: "800" },
    ],
  },
  {
    index: "07",
    title: "식사류",
    items: [
      { name: "만둣국", price: "800" },
      { name: "짬뽕밥", price: "700" },
      { name: "치킨까스", price: "700" },
      { name: "생선까스", price: "700" },
      { name: "게살 김치볶음밥", price: "700" },
      { name: "오므라이스", price: "600" },
      { name: "돌솥비빔밥", price: "700" },
      { name: "비빔밥", price: "650" },
      { name: "잡채덮밥", price: "800" },
      { name: "볶음밥", price: "700" },
      { name: "공깃밥", price: "150" },
    ],
  },
  {
    index: "08",
    title: "음료",
    items: [
      { name: "소주", price: "900" },
      { name: "맥주", price: "500" },
      { name: "와인", price: "2300" },
      { name: "콜라", price: "150" },
      { name: "스프라이트", price: "150" },
      { name: "페리에 소다", price: "250" },
    ],
  },
];

/** Display menu prices with ₹. Leaves already-formatted strings alone. */
export function formatHansikPrice(price: string): string {
  const value = price.trim();
  if (!value || value.includes("₹")) return value;
  return value.replace(/\d{3,}/g, (digits) => `₹${Number(digits).toLocaleString("en-IN")}`);
}

export function normalizeHansikMenu(input: unknown): HansikMenuSection[] | null {
  if (!Array.isArray(input)) return null;
  const sections: HansikMenuSection[] = [];
  for (const section of input) {
    if (!section || typeof section !== "object") continue;
    const title = String((section as { title?: unknown }).title ?? "").trim();
    if (!title) continue;
    const rawItems = (section as { items?: unknown }).items;
    const items: HansikMenuItem[] = [];
    if (Array.isArray(rawItems)) {
      for (const item of rawItems) {
        if (!item || typeof item !== "object") continue;
        const name = String((item as { name?: unknown }).name ?? "").trim();
        const price = String((item as { price?: unknown }).price ?? "").trim();
        if (!name) continue;
        items.push({ name, price });
      }
    }
    sections.push({
      index: String(sections.length + 1).padStart(2, "0"),
      title,
      wide: Boolean((section as { wide?: unknown }).wide),
      items,
    });
  }
  return sections;
}

export function readHansikMenu(raw: string | null | undefined): HansikMenuSection[] {
  if (!raw) return HANSIK_MENU;
  try {
    return normalizeHansikMenu(JSON.parse(raw)) ?? HANSIK_MENU;
  } catch {
    return HANSIK_MENU;
  }
}
