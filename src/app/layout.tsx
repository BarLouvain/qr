import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "karément",
  description: "karément — cocktails. tapas. nightlife. Oudemarkt 43, Leuven",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
