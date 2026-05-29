export const ADMIN_ROLES = [
  "SUPER_ADMIN",
  "HOTEL_MANAGER",
  "RECEPTION",
  "HOUSEKEEPING",
  "VIEWER",
] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export type Permission =
  | "dashboard:view"
  | "guests:view"
  | "guests:edit"
  | "guests:export"
  | "rooms:view"
  | "rooms:edit"
  | "pickups:view"
  | "pickups:edit"
  | "content:view"
  | "content:edit"
  | "rates:view"
  | "rates:edit"
  | "reservations:view"
  | "inquiries:view"
  | "inquiries:edit"
  | "settings:view"
  | "settings:edit"
  | "users:manage"
  | "audit:view"
  | "mvs:sync";

const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  SUPER_ADMIN: [
    "dashboard:view",
    "guests:view",
    "guests:edit",
    "guests:export",
    "rooms:view",
    "rooms:edit",
    "pickups:view",
    "pickups:edit",
    "content:view",
    "content:edit",
    "rates:view",
    "rates:edit",
    "reservations:view",
    "inquiries:view",
    "inquiries:edit",
    "settings:view",
    "settings:edit",
    "users:manage",
    "audit:view",
    "mvs:sync",
  ],
  HOTEL_MANAGER: [
    "dashboard:view",
    "guests:view",
    "guests:edit",
    "guests:export",
    "rooms:view",
    "rooms:edit",
    "pickups:view",
    "pickups:edit",
    "content:view",
    "content:edit",
    "rates:view",
    "rates:edit",
    "reservations:view",
    "inquiries:view",
    "inquiries:edit",
    "settings:view",
    "audit:view",
    "mvs:sync",
  ],
  RECEPTION: [
    "dashboard:view",
    "guests:view",
    "guests:edit",
    "rooms:view",
    "pickups:view",
    "pickups:edit",
    "reservations:view",
    "inquiries:view",
    "inquiries:edit",
    "mvs:sync",
  ],
  HOUSEKEEPING: ["dashboard:view", "rooms:view", "rooms:edit"],
  VIEWER: [
    "dashboard:view",
    "guests:view",
    "rooms:view",
    "pickups:view",
    "reservations:view",
    "inquiries:view",
  ],
};

export function isAdminRole(value: string): value is AdminRole {
  return (ADMIN_ROLES as readonly string[]).includes(value);
}

export function hasPermission(role: AdminRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function roleLabel(role: AdminRole): string {
  const labels: Record<AdminRole, string> = {
    SUPER_ADMIN: "Super Admin",
    HOTEL_MANAGER: "Hotel Manager",
    RECEPTION: "Reception Staff",
    HOUSEKEEPING: "Housekeeping",
    VIEWER: "Read-only Viewer",
  };
  return labels[role];
}
