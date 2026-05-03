"use client";

import { useState, useRef, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useGetFullMenu, useListTags } from "@/lib/api/hooks";
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
  const [dark, setDark] = useState(false);
  const navScrollRef = useRef<HTMLDivElement>(null);
  const menu = useGetFullMenu();
  const { data: tagDefs = [] } = useListTags();

  // Load dark mode preference from localStorage
  useEffect(() => {
    try {
      setDark(localStorage.getItem("menu-dark") === "1");
    } catch {}
  }, []);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    try {
      localStorage.setItem("menu-dark", next ? "1" : "0");
    } catch {}
  }

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
    <div
      className={dark ? "menu-theme dark" : "menu-theme"}
      style={{ fontFamily: "'DM Sans', sans-serif", background: "var(--bg)", minHeight: "100vh" }}
    >
      {/* Header */}
      <header style={{ padding: "48px 32px 36px", borderBottom: "1px solid var(--border)", background: "var(--bg)", textAlign: "center", position: "relative" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <img
            src="/logo.png"
            alt="karément — cocktails. Tapas. Nightlife."
            style={{
              maxWidth: "min(340px, 72vw)",
              height: "auto",
              display: "block",
              margin: "0 auto 20px",
              ...(dark
                ? { filter: "invert(1)", mixBlendMode: "screen" }
                : { mixBlendMode: "multiply" }),
            }}
          />
          <p style={{ fontSize: "11px", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--text-muted)", margin: 0 }}>
            Oudemarkt 43 — Leuven
          </p>
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={toggleDark}
          aria-label={dark ? "Schakel naar lichte modus" : "Schakel naar donkere modus"}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "50%",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: "16px",
            transition: "background 0.2s, border-color 0.2s",
            color: "var(--text-muted)",
          }}
        >
          {dark ? "☀️" : "🌙"}
        </button>
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
              <div key={i} style={{ height: "24px", borderRadius: "4px", background: "var(--surface)", width: i % 2 === 0 ? "70%" : "40%", animation: "pulse 1.5s ease-in-out infinite" }} />
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
                <p style={{ fontSize: "15px", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--accent)", margin: "36px 0 16px", paddingBottom: "10px", borderBottom: "1px solid var(--border)" }}>
                  {category.label}
                </p>
                {category.note && (
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic", margin: "4px 0 16px", padding: "10px 14px", borderLeft: "2px solid var(--border-strong)", background: "var(--surface)", borderRadius: "0 4px 4px 0" }}>
                    {category.note}
                  </p>
                )}
                {category.items.map((item) => (
                  <MenuItemRow key={item.id} item={item} tagDefs={tagDefs} />
                ))}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ textAlign: "center", padding: "40px 32px", borderTop: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-faint)", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase" }}>

        {/* Socials */}
        <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginBottom: "24px" }}>
          <a
            href="https://www.instagram.com/karementleuven"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            style={{ color: "var(--text-muted)", transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
          <a
            href="https://www.facebook.com/p/Kar%C3%A9ment-100063445128456/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            style={{ color: "var(--text-muted)", transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>
        </div>

        {/* Google review button */}
        <a
          href="https://www.google.com/search?q=Karement+Reviews+Leuven&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qOdS5HqyYOP3THZtbnO7UtDQFnGp8uoEU6P7xaGmmAdDNH6J6RRNAKNlml27q1OnZL6X04nEGwwb4PnlF7DOjzjYUGWAh"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 20px",
            marginBottom: "28px",
            border: "1px solid var(--border-strong)",
            borderRadius: "8px",
            background: "var(--bg)",
            color: "var(--text-muted)",
            fontSize: "11px",
            letterSpacing: "0.15em",
            textDecoration: "none",
            transition: "border-color 0.2s, color 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--text)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.color = "var(--text-muted)"; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#f5b301" stroke="#f5b301" strokeWidth="1" strokeLinejoin="round"/>
          </svg>
          <span>Laat een review achter</span>
        </a>

        <div>
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
        </div>
      </footer>
    </div>
  );
}
