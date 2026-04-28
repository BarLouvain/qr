import { AdminApp } from "@/components/admin/AdminApp";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <AdminApp>{children}</AdminApp>;
}
