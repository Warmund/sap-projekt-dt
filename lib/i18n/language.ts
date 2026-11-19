export type Language = "de" | "en";
export const LANGUAGE_COOKIE = "sap-language";
export const readLanguage = (value?: string): Language => value === "en" ? "en" : "de";
