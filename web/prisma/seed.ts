import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { HOTEL_IMAGES } from "../src/lib/hotel-images";
import { LOTUS_ROOM_NUMBERS } from "../src/lib/lotus-rooms";

const prisma = new PrismaClient();

const HERO_IMAGES = HOTEL_IMAGES.hero;

const roomSeeds = [
  {
    code: "M",
    nameKo: "M Room (Standard Double)",
    description: "침실과 화장실로 구성되어 있습니다. 기본 숙박에는 조식, 청소, 세탁이 포함됩니다.",
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
    inventory: 7,
    baseRate: 6800,
  },
  {
    code: "B",
    nameKo: "B Room (Deluxe Suite)",
    description: "거실, 침실, 화장실로 구성되어 있습니다. 기본 숙박에는 조식, 청소, 세탁이 포함됩니다.",
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
    inventory: 15,
    baseRate: 9500,
  },
] as const;

const ROOM_CODE_MIGRATION: Record<string, string> = {
  STANDARD: "M",
  DELUXE: "M",
  SUITE: "B",
};

async function seedTenant(
  slug: string,
  nameKo: string,
  mvsEnabled: boolean,
  mvsCompanyId: number | null,
  contact: { address: string; phone: string; email: string; whatsapp: string },
  roomsByType?: Record<string, readonly string[]>,
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

  if (roomsByType?.S) {
    await prisma.roomType.upsert({
      where: { tenantId_code: { tenantId: tenant.id, code: "S" } },
      update: { nameKo: "S Room", inventory: roomsByType.S.length, imageUrl: HOTEL_IMAGES.rooms.S },
      create: {
        tenantId: tenant.id,
        code: "S",
        nameKo: "S Room",
        description: "1실입니다.",
        features: "[]",
        imageUrl: HOTEL_IMAGES.rooms.S,
        inventory: roomsByType.S.length,
        baseRate: 0,
      },
    });
  }

  const roomTypes = await prisma.roomType.findMany({ where: { tenantId: tenant.id } });
  const typeByCode = Object.fromEntries(roomTypes.map((t) => [t.code, t]));

  const roomNumbers = roomsByType
    ? Object.entries(roomsByType).flatMap(([type, numbers]) => numbers.map((num) => ({ num, type, occ: "available", clean: "clean" })))
    : [
        { num: "101", type: "M", occ: "occupied", clean: "clean" },
        { num: "102", type: "M", occ: "available", clean: "clean" },
        { num: "103", type: "M", occ: "occupied", clean: "dirty" },
        { num: "201", type: "M", occ: "available", clean: "clean" },
        { num: "202", type: "M", occ: "occupied", clean: "clean" },
        { num: "301", type: "B", occ: "available", clean: "in_progress" },
        { num: "302", type: "B", occ: "reserved", clean: "clean" },
      ];

  if (roomsByType) {
    const keep = new Set(roomNumbers.map((room) => room.num));
    const stale = await prisma.room.findMany({
      where: { tenantId: tenant.id, roomNumber: { notIn: [...keep] } },
      select: { id: true },
    });
    if (stale.length) {
      await prisma.guest.updateMany({ where: { roomId: { in: stale.map((room) => room.id) } }, data: { roomId: null } });
      await prisma.room.deleteMany({ where: { id: { in: stale.map((room) => room.id) } } });
    }
  }

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

  for (const code of Object.keys(typeByCode)) {
    const count = roomNumbers.filter((room) => room.type === code).length;
    if (!count || !typeByCode[code]) continue;
    await prisma.roomType.update({ where: { id: typeByCode[code].id }, data: { inventory: count } });
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
      roomNumber: roomsByType?.M?.[0] ?? "101",
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
      roomNumber: roomsByType?.M?.[1] ?? "202",
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
  const legacy = await prisma.adminUser.findUnique({ where: { email: "admin@hotellotus.in" } });
  if (legacy) {
    await prisma.adminUser.update({
      where: { id: legacy.id },
      data: { email: "root", passwordHash: hash, name: "Super Admin", role: "SUPER_ADMIN", tenantId, active: true },
    });
  }
  await prisma.adminUser.upsert({
    where: { email: "root" },
    update: { passwordHash: hash, name: "Super Admin", role: "SUPER_ADMIN", tenantId, active: true },
    create: {
      email: "root",
      passwordHash: hash,
      name: "Super Admin",
      role: "SUPER_ADMIN",
      tenantId,
    },
  });
  const receptionHash = await bcrypt.hash("admin123", 10);
  await prisma.adminUser.upsert({
    where: { email: "reception@hotellotus.in" },
    update: { name: "Reception Desk", role: "RECEPTION", tenantId, active: true },
    create: {
      email: "reception@hotellotus.in",
      passwordHash: receptionHash,
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
    LOTUS_ROOM_NUMBERS,
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
  console.log("Admin login: root / LOTUS_ADMIN_PASSWORD");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
