"use client";

import "@ui5/webcomponents-theming/dist/generated/json-imports/Themes.js";
import "@ui5/webcomponents/dist/generated/json-imports/Themes.js";
import "@ui5/webcomponents-fiori/dist/generated/json-imports/Themes.js";
import { createContext, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { setTheme as setUi5Theme } from "@ui5/webcomponents-base/dist/config/Theme.js";
import { THEME_COOKIE, UI5_THEME, type ResolvedTheme, type ThemeMode } from "../lib/theme";

const ThemeModeContext = createContext<{ mode: ThemeMode; setMode: (value: ThemeMode) => void }>({
  mode: "light",
  setMode: () => {},
});

const darkQuery = "(prefers-color-scheme: dark)";

function subscribeToSystemTheme(onChange: () => void) {
  const query = window.matchMedia(darkQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export function ThemeModeProvider({ initial, children }: { initial: ThemeMode; children: ReactNode }) {
  const [mode, updateMode] = useState(initial);
  const systemDark = useSyncExternalStore(subscribeToSystemTheme, () => window.matchMedia(darkQuery).matches, () => false);
  // The login page keeps its light, hand-styled look regardless of the setting.
  const isLogin = usePathname()?.startsWith("/login") ?? false;

  const resolved: ResolvedTheme = isLogin ? "light" : mode === "system" ? (systemDark ? "dark" : "light") : mode;

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = resolved;
    root.style.colorScheme = resolved;
    void setUi5Theme(UI5_THEME[resolved]);
  }, [resolved]);

  function setMode(value: ThemeMode) {
    document.cookie = `${THEME_COOKIE}=${value}; Path=/; Max-Age=31536000; SameSite=Lax`;
    updateMode(value);
  }

  return <ThemeModeContext.Provider value={{ mode, setMode }}>{children}</ThemeModeContext.Provider>;
}

export function useThemeMode() {
  return useContext(ThemeModeContext);
}
