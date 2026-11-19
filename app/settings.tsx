"use client";

import { DynamicPage } from "@ui5/webcomponents-react/DynamicPage";
import { DynamicPageTitle } from "@ui5/webcomponents-react/DynamicPageTitle";
import { Label } from "@ui5/webcomponents-react/Label";
import { Option } from "@ui5/webcomponents-react/Option";
import { Select } from "@ui5/webcomponents-react/Select";
import { Title } from "@ui5/webcomponents-react/Title";
import { useLanguage } from "./language";

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

export function Settings() {
  const { t } = useLanguage();
  return <DynamicPage hidePinButton className="app-page"
    titleArea={<DynamicPageTitle heading={<Title level="H1" size="H3">{t("Einstellungen")}</Title>} />}>
    <div className="rg-page rg-narrow">
      <section className="rg-section"><LanguageSelect /></section>
    </div>
  </DynamicPage>;
}
