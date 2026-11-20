"use client";

import { DynamicPage } from "@ui5/webcomponents-react/DynamicPage";
import { DynamicPageTitle } from "@ui5/webcomponents-react/DynamicPageTitle";
import { Label } from "@ui5/webcomponents-react/Label";
import { Option } from "@ui5/webcomponents-react/Option";
import { Select } from "@ui5/webcomponents-react/Select";
import { Title } from "@ui5/webcomponents-react/Title";
import { useLanguage } from "./language";
import { useThemeMode } from "./theme";

export function LanguageSelect() {
  const { language, setLanguage, t } = useLanguage();
  return <div className="language-field">
    <Label for="app-language">{t("Sprache")}</Label>
    <Select id="app-language" accessibleName={t("Sprache")} value={language}
      onChange={(e) => setLanguage(e.target.value === "en" ? "en" : "de")}>
      <Option value="de">Deutsch</Option>
      <Option value="en">English</Option>
    </Select>
  </div>;
}

export function ThemeSelect() {
  const { t } = useLanguage();
  const { mode, setMode } = useThemeMode();
  return <div className="language-field">
    <Label for="app-theme">{t("Darstellung")}</Label>
    <Select id="app-theme" accessibleName={t("Darstellung")} value={mode}
      onChange={(e) => setMode(e.target.value === "dark" || e.target.value === "system" ? e.target.value : "light")}>
      <Option value="light">{t("Hell")}</Option>
      <Option value="dark">{t("Dunkel")}</Option>
      <Option value="system">{t("Wie System")}</Option>
    </Select>
  </div>;
}

export function Settings() {
  const { t } = useLanguage();
  return <DynamicPage hidePinButton className="app-page"
    titleArea={<DynamicPageTitle heading={<Title level="H1" size="H3">{t("Einstellungen")}</Title>} />}>
    <div className="rg-page rg-narrow">
      <section className="rg-section"><LanguageSelect /></section>
      <section className="rg-section"><ThemeSelect /></section>
    </div>
  </DynamicPage>;
}
