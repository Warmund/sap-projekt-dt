export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";
export const THEME_COOKIE = "sap-theme";
export const readThemeMode = (value?: string): ThemeMode => value === "dark" || value === "system" ? value : "light";
export const UI5_THEME: Record<ResolvedTheme, string> = { light: "sap_horizon", dark: "sap_horizon_dark" };
