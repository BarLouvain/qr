"use client";

import { useRouter } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminLayout } from "./AdminLayout";
import { setAuthTokenGetter } from "@/lib/api/client";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
});

// Geen token meer nodig — auth via cookie
setAuthTokenGetter(() => null);

interface AdminAppProps {
  children: React.ReactNode;
}

export function AdminApp({ children }: AdminAppProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    queryClient.clear();
    router.push("/login");
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AdminLayout onLogout={handleLogout}>{children}</AdminLayout>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
