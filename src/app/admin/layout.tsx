import { AdminApp } from "@/components/admin/AdminApp";

export const dynamic = "force-dynamic";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <AdminApp>{children}</AdminApp>;
}