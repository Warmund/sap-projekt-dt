import { cookies } from "next/headers";
import { LANGUAGE_COOKIE, readLanguage } from "../lib/i18n/language";
import { LanguageProvider } from "./language";
import { THEME_COOKIE, UI5_THEME, readThemeMode } from "../lib/theme";
import { ThemeModeProvider } from "./theme";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = { title: "SAP-Project-DT" };

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const language = readLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);
  const themeMode = readThemeMode(cookieStore.get(THEME_COOKIE)?.value);
  // An explicit choice is known on the server, so UI5 can start in that theme without a light flash.
  const initialTheme = themeMode === "dark" ? "dark" : "light";
  return (
    <html lang={language} data-theme={initialTheme}>
      <head>
        <script data-ui5-config type="application/json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({ theme: UI5_THEME[initialTheme] }) }} />
      </head>
      <body>
        <ThemeModeProvider initial={themeMode}>
          <LanguageProvider initial={language}>{children}</LanguageProvider>
        </ThemeModeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
