"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coffee, LayoutDashboard, ListTree, LogOut, Tag } from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
  onLogout?: () => void;
}

export function AdminLayout({ children, onLogout }: AdminLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-card border-r border-border shrink-0 flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-border">
          <div className="w-8 h-8 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold">
            <Coffee size={18} />
          </div>
          <span className="font-bold text-lg tracking-tight">Karement</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/admin"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
              pathname === "/admin"
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <LayoutDashboard size={18} />
            Menu Dashboard
          </Link>
          <Link
            href="/admin/sections"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
              pathname === "/admin/sections"
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <ListTree size={18} />
            Manage Sections
          </Link>
          <Link
            href="/admin/tags"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
              pathname === "/admin/tags"
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Tag size={18} />
            Tags
          </Link>
        </nav>

        {onLogout && (
          <div className="p-4 border-t border-border">
            <button
              onClick={onLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md w-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-sm"
            >
              <LogOut size={18} />
              Uitloggen
            </button>
          </div>
        )}
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
}
