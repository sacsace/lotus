import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Staff",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-[60vh]">{children}</div>;
}
