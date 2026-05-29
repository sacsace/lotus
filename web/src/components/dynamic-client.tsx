"use client";

import dynamic from "next/dynamic";

export const RatesEditorLazy = dynamic(
  () => import("@/components/rates-editor").then((m) => m.RatesEditor),
  { ssr: false, loading: () => <p className="text-sm text-muted">Loading?</p> },
);

export const InquiriesAdminLazy = dynamic(
  () => import("@/components/inquiries-admin").then((m) => m.InquiriesAdmin),
  { ssr: false, loading: () => <p className="text-sm text-muted">Loading?</p> },
);

export const AdminShellLazy = dynamic(
  () => import("@/components/admin-shell").then((m) => m.AdminShell),
  { ssr: false, loading: () => <div className="p-8 text-muted">Loading?</div> },
);

export const AdminLoginFormLazy = dynamic(
  () => import("@/components/admin-login-form").then((m) => m.AdminLoginForm),
  { ssr: false },
);

export const TenantSettingsFormLazy = dynamic(
  () => import("@/components/tenant-settings-form").then((m) => m.TenantSettingsForm),
  { ssr: false, loading: () => <p className="text-sm text-muted">Loading?</p> },
);

export const DashboardOverviewLazy = dynamic(
  () => import("@/components/admin/dashboard-overview").then((m) => m.DashboardOverview),
  { ssr: false, loading: () => <div className="h-40 animate-pulse rounded-2xl bg-beige" /> },
);

export const GuestManagementLazy = dynamic(
  () => import("@/components/admin/guest-management").then((m) => m.GuestManagement),
  { ssr: false, loading: () => <p className="text-sm text-muted">Loading?</p> },
);

export const RoomGridLazy = dynamic(
  () => import("@/components/admin/room-grid").then((m) => m.RoomGrid),
  { ssr: false, loading: () => <div className="h-40 animate-pulse rounded-2xl bg-beige" /> },
);

export const PickupManagerLazy = dynamic(
  () => import("@/components/admin/pickup-manager").then((m) => m.PickupManager),
  { ssr: false },
);

export const ContentManagerLazy = dynamic(
  () => import("@/components/admin/content-manager").then((m) => m.ContentManager),
  { ssr: false },
);
