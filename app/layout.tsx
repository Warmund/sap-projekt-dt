import { cookies } from "next/headers";
import { LANGUAGE_COOKIE, readLanguage } from "../lib/i18n/language";
import { LanguageProvider } from "./language";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = { title: "SAP-Project-DT" };

export default async function RootLayout({ children }: { children: ReactNode }) {
  const language = readLanguage((await cookies()).get(LANGUAGE_COOKIE)?.value);
  return (
    <html lang={language}>
      <body>
        <LanguageProvider initial={language}>{children}</LanguageProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
