"use client";

import { useState, useRef, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useGetFullMenu } from "@/lib/api/hooks";
import { MenuItemRow } from "./MenuItemRow";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
});

export function MenuApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <MenuContent />
    </QueryClientProvider>
  );
}

function MenuContent() {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const navScrollRef = useRef<HTMLDivElement>(null);
  const menu = useGetFullMenu();

  useEffect(() => {
    const el = navScrollRef.current;
    if (!el) return;
    const check = () => setShowScrollHint(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
    check();
    el.addEventListener("scroll", check);
    window.addEventListener("resize", check);
    return () => {
      el.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [menu.data]);

  const sections = menu.data ?? [];
  const currentSlug = activeSlug ?? sections[0]?.slug ?? null;
  const currentSection = sections.find((s) => s.slug === currentSlug) ?? sections[0] ?? null;

  return (
    <div className="menu-theme" style={{ fontFamily: "'DM Sans', sans-serif", background: "var(--bg)", minHeight: "100vh" }}>
      {/* Header */}
      <header style={{ padding: "48px 32px 36px", borderBottom: "1px solid var(--border)", background: "var(--bg)", textAlign: "center" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <img
            src="/logo.png"
            alt="karément — cocktails. Tapas. Nightlife."
            style={{ maxWidth: "min(340px, 72vw)", height: "auto", display: "block", margin: "0 auto 20px" }}
          />
          <p style={{ fontSize: "11px", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--text-muted)", margin: 0 }}>
            Oudemarkt 43 — Leuven
          </p>
        </div>
      </header>

      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "var(--bg)", borderBottom: "1px solid var(--border)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div
          ref={navScrollRef}
          style={{ maxWidth: "960px", margin: "0 auto", display: "flex", padding: "0 32px", overflowX: "auto", scrollbarWidth: "none" }}
        >
          {sections.map((section) => (
            <button
              key={section.slug}
              onClick={() => { setActiveSlug(section.slug); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              style={{
                background: "none", border: "none", padding: "16px 18px",
                fontFamily: "'DM Sans', sans-serif", fontSize: "11px", fontWeight: 500,
                letterSpacing: "0.2em", textTransform: "uppercase",
                color: currentSlug === section.slug ? "var(--text)" : "var(--text-muted)",
                cursor: "pointer", whiteSpace: "nowrap", position: "relative", transition: "color 0.2s",
              }}
            >
              {section.title}
              <span style={{
                position: "absolute", bottom: 0, left: "18px", right: "18px", height: "2px",
                background: "var(--accent)",
                transform: currentSlug === section.slug ? "scaleX(1)" : "scaleX(0)",
                transition: "transform 0.2s ease", display: "block",
              }} />
            </button>
          ))}
        </div>
      </nav>

      {/* Scroll hint */}
      {showScrollHint && (
        <div style={{ textAlign: "right", padding: "5px 20px 5px", fontSize: "10px", letterSpacing: "0.15em", color: "var(--text-faint)", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "5px", pointerEvents: "none", userSelect: "none" }}>
          <span style={{ textTransform: "uppercase" }}>scroll voor meer</span>
          <span style={{ fontSize: "13px" }}>→</span>
        </div>
      )}

      {/* Main */}
      <main style={{ maxWidth: "960px", margin: "0 auto", padding: "48px 32px 80px" }}>
        <style>{`
          @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
          @keyframes pulse { 0%,100% { opacity:0.5; } 50% { opacity:1; } }
          @media (max-width:600px) {
            .karement-main { padding: 32px 20px 60px !important; }
          }
        `}</style>

        {menu.isLoading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", paddingTop: "20px" }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ height: "24px", borderRadius: "4px", background: "#f0f0f0", width: i % 2 === 0 ? "70%" : "40%", animation: "pulse 1.5s ease-in-out infinite" }} />
            ))}
          </div>
        )}

        {menu.isError && (
          <p style={{ color: "var(--text-muted)", fontStyle: "italic", paddingTop: "20px" }}>
            Menu kon niet geladen worden. Probeer opnieuw.
          </p>
        )}

        {currentSection && (
          <div key={currentSection.slug} style={{ animation: "fadeUp 0.4s ease forwards" }}>
            {/* Section header */}
            <div style={{ display: "flex", alignItems: "baseline", gap: "16px", marginBottom: "36px" }}>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(32px, 6vw, 52px)", letterSpacing: "0.04em", color: "var(--text)", lineHeight: 1 }}>
                {currentSection.title}
              </h2>
              <div style={{ flex: 1, height: "1px", background: "linear-gradient(to right, var(--border-strong), transparent)" }} />
            </div>

            {/* Categories */}
            {currentSection.categories.map((category) => (
              <div key={category.id}>
                <p style={{ fontSize: "10px", letterSpacing: "0.35em", textTransform: "uppercase", color: "var(--accent)", margin: "36px 0 16px", paddingBottom: "10px", borderBottom: "1px solid var(--border)" }}>
                  {category.label}
                </p>
                {category.note && (
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic", margin: "4px 0 16px", padding: "10px 14px", borderLeft: "2px solid var(--border-strong)", background: "var(--surface)", borderRadius: "0 4px 4px 0" }}>
                    {category.note}
                  </p>
                )}
                {category.items.map((item) => (
                  <MenuItemRow key={item.id} item={item} />
                ))}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ textAlign: "center", padding: "40px 32px", borderTop: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-faint)", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase" }}>
        karément — Oudemarkt 43, Leuven
        <br />
        Allergieën? Vraag ons gerust —{" "}
        <span style={{ color: "var(--accent)" }}>we helpen je graag.</span>
        <br />
        <br />
        Alle prijzen zijn inclusief BTW
        <br />
        <br />
        <span style={{ color: "var(--text)", fontWeight: 600 }}>1 rekening per tafel.</span>
      </footer>
    </div>
  );
}
