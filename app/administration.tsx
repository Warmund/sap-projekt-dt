import { useLanguage } from "./language";
import { Button } from "@ui5/webcomponents-react/Button";
import { DynamicPage } from "@ui5/webcomponents-react/DynamicPage";
import { DynamicPageTitle } from "@ui5/webcomponents-react/DynamicPageTitle";
import { Tab } from "@ui5/webcomponents-react/Tab";
import { TabContainer } from "@ui5/webcomponents-react/TabContainer";
import { Text } from "@ui5/webcomponents-react/Text";
import { Title } from "@ui5/webcomponents-react/Title";
import { RegisterContacts } from "./_register/contacts";
import { useRegister } from "./_register/store";
import { Section } from "./_register/ui";
import { Users } from "./users";

export type AdministrationView = "admin-imports" | "admin-cloud" | "rg-contacts" | "users";

export function Administration({ view, isAdmin, onSelect }: {
  view: AdministrationView;
  isAdmin: boolean;
  onSelect: (view: AdministrationView) => void;
}) {
  const { t } = useLanguage();
  const { open, openRegister, partners } = useRegister();
  const missingTenants = partners.filter((partner) => partner.cloudCustomer && partner.tenants.length === 0).length;

  return <DynamicPage hidePinButton className="app-page"
    titleArea={<DynamicPageTitle heading={<Title level="H1" size="H3">Administration</Title>} />}>
    <TabContainer onTabSelect={({ detail }) => {
      const key = detail.tab.dataset.key;
      if (key === "admin-imports" || key === "admin-cloud" || key === "rg-contacts" || (key === "users" && isAdmin)) onSelect(key);
    }}>
      <Tab text={t("Sperrfälle")} data-key="admin-imports" selected={view === "admin-imports"}>
        <div className="rg-page">
          <Section title={t("Geschäftspartner und Sperrfälle")}
            actions={<Button onClick={() => open("rg-new")}>{t("Datensatz manuell erfassen")}</Button>}>
            <Text>{t("Geplanter Import aus einem Datenprodukt für SAP GTS. Benötigt werden Geschäftspartner-ID, Sperrdatum, ETS-Kategorie und Sanktionsliste. Bis zur Anbindung stehen der CSV-Import und die simulierte Erfassung zur Verfügung.")}</Text>
          </Section>
        </div>
      </Tab>
      <Tab text={t("Cloud-Tenants")} data-key="admin-cloud" selected={view === "admin-cloud"}>
        <div className="rg-page">
          <Section title={t("Cloud-Nutzung und Tenants")}
            actions={<Button onClick={() => openRegister("cloudMissing")}>{t("Betroffene Kunden anzeigen")}</Button>}>
            <Text>{missingTenants} {t("Cloud-Kunden ohne Tenant-Daten. Ein künftiges Datenprodukt soll Tenant-ID, Produkt und Line of Business je Geschäftspartner liefern. Die Quelle ist noch zu klären.")}</Text>
          </Section>
        </div>
      </Tab>
      <Tab text={t("Länder-Kontakte")} data-key="rg-contacts" selected={view === "rg-contacts"}>
        {view === "rg-contacts" && <RegisterContacts />}
      </Tab>
      {isAdmin && <Tab text={t("Nutzer")} data-key="users" selected={view === "users"}>
        {view === "users" && <Users />}
      </Tab>}
    </TabContainer>
  </DynamicPage>;
}
