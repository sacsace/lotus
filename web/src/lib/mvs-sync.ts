import { prisma } from "@/lib/prisma";
import { getAdminTenant } from "@/lib/admin-api";
import { mvsGetGuests, mvsGetRooms } from "@/lib/mvs";
import { logAdminAction } from "@/lib/audit";

export async function syncTenantFromMvs(
  tenantId: string,
  mvsEnabled: boolean,
  mvsCompanyId: number | null,
  adminUserId?: string,
) {
  const mvsParams = { mvsEnabled, mvsCompanyId };
  const [guestsRes, roomsRes] = await Promise.all([mvsGetGuests(mvsParams), mvsGetRooms(mvsParams)]);

  let guestsSynced = 0;
  let roomsSynced = 0;

  if (guestsRes.data?.guests) {
    for (const g of guestsRes.data.guests) {
      await prisma.guest.upsert({
        where: { id: g.id },
        update: {
          guestName: g.guestName,
          companyName: g.companyName,
          roomNumber: g.roomNumber,
          checkIn: new Date(g.checkIn),
          checkOut: new Date(g.checkOut),
          nationality: g.nationality,
          passportNumber: g.passportNumber,
          visaNumber: g.visaNumber,
          phone: g.phone,
          email: g.email,
          airportPickupStatus: g.airportPickupStatus ?? "none",
          mealOption: g.mealOption,
          cFormStatus: g.cFormStatus ?? "pending",
          notes: g.notes,
          mvsGuestId: g.id,
        },
        create: {
          id: g.id,
          tenantId,
          guestName: g.guestName,
          companyName: g.companyName,
          roomNumber: g.roomNumber,
          checkIn: new Date(g.checkIn),
          checkOut: new Date(g.checkOut),
          nationality: g.nationality,
          passportNumber: g.passportNumber,
          visaNumber: g.visaNumber,
          phone: g.phone,
          email: g.email,
          airportPickupStatus: g.airportPickupStatus ?? "none",
          mealOption: g.mealOption,
          cFormStatus: g.cFormStatus ?? "pending",
          notes: g.notes,
          mvsGuestId: g.id,
        },
      });
      guestsSynced++;
    }
  }

  if (roomsRes.data?.rooms) {
    for (const r of roomsRes.data.rooms) {
      await prisma.room.upsert({
        where: { tenantId_roomNumber: { tenantId, roomNumber: r.roomNumber } },
        update: {
          occupancyStatus: r.occupancyStatus,
          cleaningStatus: r.cleaningStatus,
          maintenanceStatus: r.maintenanceStatus,
        },
        create: {
          tenantId,
          roomNumber: r.roomNumber,
          occupancyStatus: r.occupancyStatus,
          cleaningStatus: r.cleaningStatus,
          maintenanceStatus: r.maintenanceStatus,
        },
      });
      roomsSynced++;
    }
  }

  await prisma.tenant.update({
    where: { id: tenantId },
    data: { lastMvsSyncAt: new Date() },
  });

  if (adminUserId) {
    await logAdminAction({
      adminUserId,
      tenantId,
      action: "MVS_SYNC",
      resource: "tenant",
      details: JSON.stringify({ guestsSynced, roomsSynced, localOnly: guestsRes.localOnly }),
    });
  }

  return { guestsSynced, roomsSynced, localOnly: guestsRes.localOnly || roomsRes.localOnly };
}

export async function getDashboardStats(tenantId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    checkInsToday,
    checkOutsToday,
    currentGuests,
    occupiedRooms,
    availableRooms,
    pendingPickups,
    pendingCForms,
    mealGuests,
    newInquiries,
  ] = await Promise.all([
    prisma.guest.count({ where: { tenantId, checkIn: { gte: today, lt: tomorrow } } }),
    prisma.guest.count({ where: { tenantId, checkOut: { gte: today, lt: tomorrow } } }),
    prisma.guest.count({ where: { tenantId, checkIn: { lte: today }, checkOut: { gt: today } } }),
    prisma.room.count({ where: { tenantId, occupancyStatus: "occupied" } }),
    prisma.room.count({ where: { tenantId, occupancyStatus: "available" } }),
    prisma.airportPickup.count({ where: { tenantId, status: "pending" } }),
    prisma.guest.count({ where: { tenantId, cFormStatus: "pending" } }),
    prisma.guest.count({ where: { tenantId, mealOption: { not: null } } }),
    prisma.inquiry.count({ where: { tenantId, status: "new" } }),
  ]);

  return {
    checkInsToday,
    checkOutsToday,
    currentGuests,
    occupiedRooms,
    availableRooms,
    pendingPickups,
    pendingCForms,
    mealGuests,
    newInquiries,
  };
}

export async function getAdminTenantOrThrow() {
  const tenant = await getAdminTenant();
  if (!tenant) throw new Error("NO_TENANT");
  return tenant;
}
