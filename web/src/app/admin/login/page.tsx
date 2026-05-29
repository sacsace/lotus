import { AdminLoginFormLazy } from "@/components/dynamic-client";
import { SiteLogo } from "@/components/site-logo";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md apple-card p-10">
        <div className="flex justify-center">
          <SiteLogo variant="auth" />
        </div>
        <h1 className="mt-6 text-center text-2xl font-semibold tracking-tight">Staff Login</h1>
        <p className="mt-2 text-sm text-muted">Secure operations dashboard — guest data is never public.</p>
        <AdminLoginFormLazy />
      </div>
    </div>
  );
}
