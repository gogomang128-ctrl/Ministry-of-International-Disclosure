import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "وزارة الكشف الدولي لمصر ودول العالم | البوابة السيادية الرسمية",
  description:
    "البوابة الرسمية لوزارة الكشف الدولي لمصر ودول العالم — التحكيم الدولي، الوساطة، التفاوض، ترسيم الحدود، وتوثيق المعاهدات. بالتنسيق الكامل مع وزارة الدفاع المصرية.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Noto+Kufi+Arabic:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-obsidian font-plex text-ivory antialiased">{children}</body>
    </html>
  );
}
