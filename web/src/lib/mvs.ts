/**
 * MVS integration — central operational system client.
 */

const MVS_TIMEOUT_MS = 12_000;

function mvsConfig() {
  return {
    base: process.env.MVS_BASE_URL?.replace(/\/$/, "") ?? "",
    key: process.env.MVS_API_KEY ?? "",
  };
}

async function mvsFetch<T>(
  path: string,
  init?: RequestInit & { mvsEnabled?: boolean; mvsCompanyId?: number | null },
): Promise<{ data?: T; error?: string; localOnly?: boolean }> {
  const { base, key } = mvsConfig();
  if (init?.mvsEnabled === false || init?.mvsCompanyId == null) {
    return { localOnly: true };
  }
  if (!base || !key) {
    return { localOnly: true, error: "MVS not configured" };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), MVS_TIMEOUT_MS);
    const res = await fetch(`${base}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });
    clearTimeout(timer);
    if (!res.ok) return { error: `MVS HTTP ${res.status}` };
    const data = (await res.json()) as T;
    return { data };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "MVS request failed" };
  }
}

export type MvsGuest = {
  id: string;
  guestName: string;
  companyName?: string;
  roomNumber?: string;
  checkIn: string;
  checkOut: string;
  nationality?: string;
  passportNumber?: string;
  visaNumber?: string;
  phone?: string;
  email?: string;
  airportPickupStatus?: string;
  mealOption?: string;
  cFormStatus?: string;
  notes?: string;
};

export type MvsRoom = {
  roomNumber: string;
  occupancyStatus: string;
  cleaningStatus: string;
  maintenanceStatus: string;
  roomType?: string;
  guestName?: string;
};

export type MvsBooking = {
  id: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  roomType: string;
  status: string;
};

export async function mvsGetBookings(params: { mvsEnabled?: boolean; mvsCompanyId?: number | null }) {
  const q = params.mvsCompanyId != null ? `?companyId=${params.mvsCompanyId}` : "";
  return mvsFetch<{ bookings: MvsBooking[] }>(`/api/bookings${q}`, { mvsEnabled: params.mvsEnabled, mvsCompanyId: params.mvsCompanyId });
}

export async function mvsGetGuests(params: { mvsEnabled?: boolean; mvsCompanyId?: number | null }) {
  const q = params.mvsCompanyId != null ? `?companyId=${params.mvsCompanyId}` : "";
  return mvsFetch<{ guests: MvsGuest[] }>(`/api/guests${q}`, { mvsEnabled: params.mvsEnabled, mvsCompanyId: params.mvsCompanyId });
}

export async function mvsGetRooms(params: { mvsEnabled?: boolean; mvsCompanyId?: number | null }) {
  const q = params.mvsCompanyId != null ? `?companyId=${params.mvsCompanyId}` : "";
  return mvsFetch<{ rooms: MvsRoom[] }>(`/api/rooms${q}`, { mvsEnabled: params.mvsEnabled, mvsCompanyId: params.mvsCompanyId });
}

export async function mvsPostCheckin(body: Record<string, unknown>, params: { mvsEnabled?: boolean; mvsCompanyId?: number | null }) {
  return mvsFetch<{ ok: boolean }>("/api/checkin", {
    method: "POST",
    body: JSON.stringify({ ...body, companyId: params.mvsCompanyId }),
    mvsEnabled: params.mvsEnabled,
    mvsCompanyId: params.mvsCompanyId,
  });
}

export async function mvsPostCheckout(body: Record<string, unknown>, params: { mvsEnabled?: boolean; mvsCompanyId?: number | null }) {
  return mvsFetch<{ ok: boolean }>("/api/checkout", {
    method: "POST",
    body: JSON.stringify({ ...body, companyId: params.mvsCompanyId }),
    mvsEnabled: params.mvsEnabled,
    mvsCompanyId: params.mvsCompanyId,
  });
}

export async function mvsPostPickupStatus(body: Record<string, unknown>, params: { mvsEnabled?: boolean; mvsCompanyId?: number | null }) {
  return mvsFetch<{ ok: boolean }>("/api/pickup-status", {
    method: "POST",
    body: JSON.stringify({ ...body, companyId: params.mvsCompanyId }),
    mvsEnabled: params.mvsEnabled,
    mvsCompanyId: params.mvsCompanyId,
  });
}

export async function mvsPostCformStatus(body: Record<string, unknown>, params: { mvsEnabled?: boolean; mvsCompanyId?: number | null }) {
  return mvsFetch<{ ok: boolean }>("/api/cform-status", {
    method: "POST",
    body: JSON.stringify({ ...body, companyId: params.mvsCompanyId }),
    mvsEnabled: params.mvsEnabled,
    mvsCompanyId: params.mvsCompanyId,
  });
}

export type MvsAvailabilityHint = {
  source: "mvs" | "unconfigured";
  note?: string;
  roomHints?: Record<string, { available?: number }>;
};

export async function fetchMvsAvailability(params: {
  checkIn: string;
  checkOut: string;
  mvsEnabled?: boolean;
  mvsCompanyId?: number | null;
}): Promise<MvsAvailabilityHint | null> {
  if (!params.mvsEnabled) {
    return { source: "unconfigured", note: "Tenant is running independently (MVS disabled)." };
  }
  if (params.mvsCompanyId == null) {
    return { source: "unconfigured", note: "Local-only mode." };
  }
  const { base, key } = mvsConfig();
  if (!base || !key) {
    return { source: "unconfigured", note: "MVS_BASE_URL / MVS_API_KEY not set." };
  }
  try {
    const url = new URL("/api/hotel/availability", base);
    url.searchParams.set("checkIn", params.checkIn);
    url.searchParams.set("checkOut", params.checkOut);
    url.searchParams.set("companyId", String(params.mvsCompanyId));
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${key}` },
      next: { revalidate: 30 },
    });
    if (!res.ok) return { source: "mvs", note: `MVS HTTP ${res.status}` };
    const data = (await res.json()) as MvsAvailabilityHint;
    return { ...data, source: "mvs" };
  } catch {
    return { source: "mvs", note: "MVS request failed. Using local inventory." };
  }
}

export async function pushReservationToMvs(payload: {
  publicCode: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  roomTypeCode: string;
  totalAmount: number;
  mvsEnabled?: boolean;
  mvsCompanyId?: number | null;
}): Promise<{ mvsBookingId?: string; error?: string }> {
  const { base, key } = mvsConfig();
  if (!payload.mvsEnabled || payload.mvsCompanyId == null || !base || !key) return {};
  try {
    const res = await fetch(`${base}/api/hotel/reservations/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return { error: `MVS ${res.status}` };
    const j = (await res.json()) as { id?: string };
    return { mvsBookingId: j.id };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "sync failed" };
  }
}
