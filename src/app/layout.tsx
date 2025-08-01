import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryProvider } from "@/providers/QueryProvider";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Donedrop",
  description:
    "Old-fashioned todo list app with a glass jar and post-it notes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className="antialiased font-ownglyph"
      >
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
        <Analytics />
      </body>
    </html>
  );
}
