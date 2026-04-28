"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SecureLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/admin");
    } else {
      setError(true);
      setShaking(true);
      setPassword("");
      setTimeout(() => setShaking(false), 500);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f0f0f", fontFamily: "'DM Sans', sans-serif" }}>
      <div
        style={{
          width: "100%", maxWidth: "360px", padding: "48px 40px",
          background: "#1a1a1a", borderRadius: "12px", border: "1px solid #2a2a2a",
          boxShadow: "0 24px 48px rgba(0,0,0,0.6)",
          animation: shaking ? "shake 0.4s ease" : undefined,
        }}
      >
        <style>{`
          @keyframes shake {
            0%,100% { transform:translateX(0); }
            20% { transform:translateX(-8px); }
            40% { transform:translateX(8px); }
            60% { transform:translateX(-6px); }
            80% { transform:translateX(6px); }
          }
        `}</style>

        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "28px", letterSpacing: "0.1em", color: "#fff", margin: "0 0 6px" }}>
            KARÉMENT
          </p>
          <p style={{ fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#666", margin: 0 }}>
            Admin toegang
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <input
              type="password"
              placeholder="Wachtwoord"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              autoFocus
              style={{
                width: "100%", padding: "12px 16px", background: "#111",
                border: error ? "1px solid #c0392b" : "1px solid #333",
                borderRadius: "6px", color: "#fff", fontSize: "14px",
                outline: "none", boxSizing: "border-box", transition: "border-color 0.2s",
              }}
            />
            {error && (
              <p style={{ fontSize: "12px", color: "#c0392b", margin: "6px 0 0", letterSpacing: "0.05em" }}>
                Onjuist wachtwoord. Probeer opnieuw.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "12px", background: "#c9a84c", border: "none",
              borderRadius: "6px", color: "#0f0f0f", fontFamily: "'DM Sans', sans-serif",
              fontSize: "13px", fontWeight: 700, letterSpacing: "0.15em",
              textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1, transition: "opacity 0.2s",
            }}
          >
            {loading ? "..." : "Inloggen"}
          </button>
        </form>
      </div>
    </div>
  );
}
