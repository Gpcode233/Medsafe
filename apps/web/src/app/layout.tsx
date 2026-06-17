import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MedSafe | Trusted Medicine Network",
  description: "Enterprise medicine verification, traceability and regulatory oversight.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
