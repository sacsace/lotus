import { AdminShellLazy } from "@/components/dynamic-client";

export default function AdminShellLayout({ children }: { children: React.ReactNode }) {
  return <AdminShellLazy>{children}</AdminShellLazy>;
}
