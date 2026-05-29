import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { HOTEL_IMAGES } from "../src/lib/hotel-images";

const prisma = new PrismaClient();

const HERO_IMAGES = HOTEL_IMAGES.hero;

const roomSeeds = [
  {
    code: "S",
    nameKo: "S Room (Single)",
    description:
      "1인 출장객을 위한 아늑한 객실 (Twin Bed). 에어컨, 전용 욕실, 업무용 책상, TV를 제공하며 매일 청소와 무료 세탁 서비스가 포함됩니다.",
    features: JSON.stringify([
      "1 Twin Bed",
      "Air conditioning",
      "Private bathroom",
      "Smart TV",
      "Free Wi-Fi",
      "Work desk",
      "Daily housekeeping",
      "Free laundry",
    ]),
    imageUrl: HOTEL_IMAGES.rooms.S,
    inventory: 12,
    baseRate: 4500,
  },
  {
    code: "M",
    nameKo: "M Room (Standard Double)",
    description:
      "커플 또는 비즈니스 출장에 적합한 중형 객실 (Queen Bed). 시티뷰 창과 모던한 인테리어, 매일 청소·무료 세탁·룸서비스를 제공합니다.",
    features: JSON.stringify([
      "1 Queen Bed",
      "Air conditioning",
      "Private bathroom",
      "Smart TV",
      "Free Wi-Fi",
      "Work desk",
      "City view",
      "Daily housekeeping",
      "Free laundry",
      "Room service",
    ]),
    imageUrl: HOTEL_IMAGES.rooms.M,
    inventory: 8,
    baseRate: 6800,
  },
  {
    code: "B",
    nameKo: "B Room (Deluxe Suite)",
    description:
      "넓은 공간과 거실을 갖춘 대형 디럭스 스위트 (King Bed). 장기 체류·가족 단위 투숙에 최적이며 무료 세탁, 룸서비스, 데일리 하우스키핑이 포함됩니다.",
    features: JSON.stringify([
      "1 King Bed",
      "Living area",
      "Air conditioning",
      "Private bathroom",
      "Smart TV",
      "Free Wi-Fi",
      "Work desk",
      "Electric kettle",
      "Daily housekeeping",
      "Free laundry",
      "Room service",
      "Long-stay support",
    ]),
    imageUrl: HOTEL_IMAGES.rooms.B,
    inventory: 4,
    baseRate: 9500,
  },
] as const;

const ROOM_CODE_MIGRATION: Record<string, string> = {
  STANDARD: "S",
  DELUXE: "M",
  SUITE: "B",
};

async function seedTenant(
  slug: string,
  nameKo: string,
  mvsEnabled: boolean,
  mvsCompanyId: number | null,
  contact: { address: string; phone: string; email: string; whatsapp: string },
) {
  const tenant = await prisma.tenant.upsert({
    where: { slug },
    update: { nameKo, mvsEnabled, mvsCompanyId, ...contact },
    create: { slug, nameKo, mvsEnabled, mvsCompanyId, ...contact },
  });

  for (const [oldCode, newCode] of Object.entries(ROOM_CODE_MIGRATION)) {
    const legacy = await prisma.roomType.findUnique({
      where: { tenantId_code: { tenantId: tenant.id, code: oldCode } },
    });
    if (!legacy) continue;
    const target = await prisma.roomType.findUnique({
      where: { tenantId_code: { tenantId: tenant.id, code: newCode } },
    });
    if (target) {
      await prisma.room.updateMany({ where: { roomTypeId: legacy.id }, data: { roomTypeId: target.id } });
      await prisma.roomType.delete({ where: { id: legacy.id } });
    } else {
      await prisma.roomType.update({ where: { id: legacy.id }, data: { code: newCode } });
    }
  }

  for (const r of roomSeeds) {
    await prisma.roomType.upsert({
      where: { tenantId_code: { tenantId: tenant.id, code: r.code } },
      update: {
        nameKo: r.nameKo,
        description: r.description,
        features: r.features,
        imageUrl: r.imageUrl,
        inventory: r.inventory,
        baseRate: r.baseRate,
      },
      create: { tenantId: tenant.id, ...r },
    });
  }

  const roomTypes = await prisma.roomType.findMany({ where: { tenantId: tenant.id } });
  const typeByCode = Object.fromEntries(roomTypes.map((t) => [t.code, t]));

  const roomNumbers = [
    { num: "101", type: "S", occ: "occupied", clean: "clean" },
    { num: "102", type: "S", occ: "available", clean: "clean" },
    { num: "103", type: "S", occ: "occupied", clean: "dirty" },
    { num: "201", type: "M", occ: "available", clean: "clean" },
    { num: "202", type: "M", occ: "occupied", clean: "clean" },
    { num: "301", type: "B", occ: "available", clean: "in_progress" },
    { num: "302", type: "B", occ: "reserved", clean: "clean" },
  ];

  for (const rn of roomNumbers) {
    await prisma.room.upsert({
      where: { tenantId_roomNumber: { tenantId: tenant.id, roomNumber: rn.num } },
      update: {
        roomTypeId: typeByCode[rn.type]?.id,
        occupancyStatus: rn.occ,
        cleaningStatus: rn.clean,
      },
      create: {
        tenantId: tenant.id,
        roomNumber: rn.num,
        roomTypeId: typeByCode[rn.type]?.id,
        occupancyStatus: rn.occ,
        cleaningStatus: rn.clean,
      },
    });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const guests = [
    {
      guestName: "Kim Min-ho",
      companyName: "Samsung India",
      roomNumber: "101",
      checkIn: today,
      checkOut: nextWeek,
      nationality: "Korean",
      passportNumber: "M12345678",
      visaNumber: "V987654",
      phone: "+91 98765 43210",
      email: "minho.kim@example.com",
      airportPickupStatus: "completed",
      mealOption: "Korean breakfast",
      cFormStatus: "verified",
    },
    {
      guestName: "Park Ji-yeon",
      companyName: "LG Electronics",
      roomNumber: "202",
      checkIn: today,
      checkOut: tomorrow,
      nationality: "Korean",
      passportNumber: "P87654321",
      phone: "+91 87654 32109",
      email: "jiyeon.park@example.com",
      airportPickupStatus: "scheduled",
      mealOption: "Korean dinner",
      cFormStatus: "submitted",
    },
  ];

  await prisma.guest.deleteMany({ where: { tenantId: tenant.id } });
  for (const g of guests) {
    const room = await prisma.room.findUnique({
      where: { tenantId_roomNumber: { tenantId: tenant.id, roomNumber: g.roomNumber } },
    });
    await prisma.guest.create({
      data: { tenantId: tenant.id, ...g, roomId: room?.id },
    });
  }

  await prisma.airportPickup.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.airportPickup.createMany({
    data: [
      {
        tenantId: tenant.id,
        guestName: "Lee Sang-woo",
        flightNumber: "KE495",
        arrivalTime: new Date(Date.now() + 3600000 * 4),
        status: "pending",
        notes: "Terminal 2, international arrivals",
      },
      {
        tenantId: tenant.id,
        guestName: "Park Ji-yeon",
        flightNumber: "6E142",
        arrivalTime: new Date(Date.now() + 3600000 * 2),
        driverName: "Rajesh K.",
        status: "assigned",
      },
    ],
  });

  await prisma.mediaAsset.deleteMany({ where: { tenantId: tenant.id, category: "hero" } });
  await prisma.mediaAsset.createMany({
    data: HERO_IMAGES.map((img, i) => ({
      tenantId: tenant.id,
      url: img.url,
      alt: img.alt,
      category: "hero",
      sortOrder: i,
    })),
  });

  const menuDate = today;
  const breakfastItems = JSON.stringify(["Steamed rice", "Doenjang soup", "Grilled mackerel", "Side dishes (3)", "Fresh bread", "Coffee & tea"]);
  const dinnerItems = JSON.stringify(["Japchae", "Kimchi jjigae", "Bulgogi", "Steamed rice", "Seasonal banchan", "Dessert"]);

  await prisma.diningMenu.upsert({
    where: { tenantId_mealType_menuDate: { tenantId: tenant.id, mealType: "breakfast", menuDate } },
    update: { items: breakfastItems },
    create: { tenantId: tenant.id, mealType: "breakfast", menuDate, items: breakfastItems },
  });
  await prisma.diningMenu.upsert({
    where: { tenantId_mealType_menuDate: { tenantId: tenant.id, mealType: "dinner", menuDate } },
    update: { items: dinnerItems },
    create: { tenantId: tenant.id, mealType: "dinner", menuDate, items: dinnerItems },
  });

  await prisma.announcement.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.announcement.create({
    data: {
      tenantId: tenant.id,
      title: "Welcome to Lotus Korean Hotel Bengaluru",
      body: "Comfortable Korean hospitality for business travelers. Airport pickup and long-stay packages available.",
      active: true,
    },
  });

  return tenant;
}

async function seedAdminUsers(tenantId: string) {
  const hash = await bcrypt.hash(process.env.LOTUS_ADMIN_PASSWORD || "admin123", 10);
  await prisma.adminUser.upsert({
    where: { email: "admin@hotellotus.in" },
    update: { passwordHash: hash, name: "Super Admin", role: "SUPER_ADMIN", tenantId, active: true },
    create: {
      email: "admin@hotellotus.in",
      passwordHash: hash,
      name: "Super Admin",
      role: "SUPER_ADMIN",
      tenantId,
    },
  });
  await prisma.adminUser.upsert({
    where: { email: "reception@hotellotus.in" },
    update: { passwordHash: hash, name: "Reception Desk", role: "RECEPTION", tenantId, active: true },
    create: {
      email: "reception@hotellotus.in",
      passwordHash: hash,
      name: "Reception Desk",
      role: "RECEPTION",
      tenantId,
    },
  });
}

async function main() {
  const india = await seedTenant(
    "lotus-india",
    "Lotus Korean Hotel — Bengaluru, India",
    true,
    1,
    {
      address: "24/1, A Block, Ferns City Road, Doddanekkundi, Bengaluru, Karnataka 560037, India",
      phone: "+91 80503 76600",
      email: "hello@hotellotus.in",
      whatsapp: "+918050376600",
    },
  );

  await seedTenant("lotus-gangnam", "Lotus Gangnam (MVS example)", true, 1, {
    address: "Seoul, Korea",
    phone: "+82 2 1234 5678",
    email: "gangnam@hotellotus.in",
    whatsapp: "+821012345678",
  });

  await seedTenant("lotus-busan", "Lotus Busan (Local-only)", false, null, {
    address: "Busan, Korea",
    phone: "+82 51 1234 5678",
    email: "busan@hotellotus.in",
    whatsapp: "+821098765432",
  });

  await seedAdminUsers(india.id);
  console.log("Seeded lotus-india (primary), lotus-gangnam, lotus-busan");
  console.log("Admin login: admin@hotellotus.in / LOTUS_ADMIN_PASSWORD (default admin123)");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
