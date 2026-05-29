"use client";

import dynamic from "next/dynamic";
import { useI18n } from "@/components/language-provider";

function WidgetLoader() {
  const { t } = useI18n();
  return <p className="text-sm text-stone-500">{t.pageLoader}</p>;
}

const BookingWizard = dynamic(
  () => import("@/components/booking-wizard").then((m) => m.BookingWizard),
  { ssr: false, loading: () => <WidgetLoader /> },
);

const InquiryForm = dynamic(
  () => import("@/components/inquiry-form").then((m) => m.InquiryForm),
  { ssr: false, loading: () => <WidgetLoader /> },
);

const ReservationLookup = dynamic(
  () => import("@/components/reservation-lookup").then((m) => m.ReservationLookup),
  { ssr: false, loading: () => <WidgetLoader /> },
);

export function TenantBookingWidget({ tenantSlug }: { tenantSlug: string }) {
  return <BookingWizard tenantSlug={tenantSlug} />;
}

export function TenantInquiryWidget({ tenantSlug }: { tenantSlug: string }) {
  return <InquiryForm tenantSlug={tenantSlug} />;
}

export function TenantLookupWidget({ tenantSlug }: { tenantSlug: string }) {
  return <ReservationLookup tenantSlug={tenantSlug} />;
}
