"use client";
import { useLanguage } from "../language";
import { useState } from "react";
import { Select } from "@ui5/webcomponents-react/Select";
import { Option } from "@ui5/webcomponents-react/Option";
import { Label } from "@ui5/webcomponents-react/Label";
import { dashboardSummary, blockingTimeline } from "../../lib/register/dashboard";
import { DynamicPage } from "@ui5/webcomponents-react/DynamicPage";
import { DynamicPageTitle } from "@ui5/webcomponents-react/DynamicPageTitle";
import { Title } from "@ui5/webcomponents-react/Title";
import { Text } from "@ui5/webcomponents-react/Text";
import { Button } from "@ui5/webcomponents-react/Button";
import { Link } from "@ui5/webcomponents-react/Link";
import { Table } from "@ui5/webcomponents-react/Table";
import { TableHeaderRow } from "@ui5/webcomponents-react/TableHeaderRow";
import { TableHeaderCell } from "@ui5/webcomponents-react/TableHeaderCell";
import { TableRow } from "@ui5/webcomponents-react/TableRow";
import { TableCell } from "@ui5/webcomponents-react/TableCell";
import { ETS_INFO } from "../../lib/register/mock-data";
import { CONTACT_CHECK_INTERVAL_DAYS, overallStatus, progress, STEP_DEFS } from "../../lib/register/workflow";
import { useRegister } from "./store";
import { BarList, countBy, KpiTile, Section, StatusBadge } from "./ui";

export function RegisterDashboard() {
  const { t, date, language } = useLanguage();
  const { partners, contacts, open, openRegister, reset } = useRegister();
  const [year, setYear] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const summary = dashboardSummary(partners, contacts);
  const { runningSteps, dueContacts } = summary;
  const months = blockingTimeline(partners, year, language);
  const maxMonth = Math.max(1, ...months.map((m) => m.value));
  const refresh = async () => {
    setRefreshing(true);
    try { await reset(); } finally { setRefreshing(false); }
  };
  const recent = [...partners].sort((a, b) => b.gtsBlockedAt.localeCompare(a.gtsBlockedAt)).slice(0, 6);

  return <DynamicPage hidePinButton className="app-page"
    titleArea={<DynamicPageTitle heading={<Title level="H1" size="H3">{t("Sanktionsregister")}</Title>}
      subheading={<Text>{t("Kundenbestand, offene Freigaben und Status der Sperrschritte")}</Text>} />}>
    <div className="rg-page">
      <div className="rg-actions"><Button onClick={refresh} disabled={refreshing}>{refreshing ? t("Registerdaten werden geladen …") : t("Daten aktualisieren")}</Button></div>
      <Section title={t("Handlungsbedarf")}>
        <div className="rg-kpi-grid">
          <KpiTile tone="approval" title={t("Zur Freigabe")} value={summary.pending} sub={t("Fälle für die Vier-Augen-Freigabe öffnen")}
            onClick={() => openRegister("pending")} />
          <KpiTile tone="warning" title={t("Offene Sperrschritte")} value={runningSteps.length} sub={t("Laufende und wartende Schritte")} onClick={() => openRegister("open")} />
          <KpiTile tone="info" title={t("Cloud-Kunden ohne Tenant-Daten")} value={summary.cloudMissing} sub={t("Tenant-IDs und LoB-Zuordnung ergänzen")} onClick={() => openRegister("cloudMissing")} />
          <KpiTile tone="warning" title={t("Länder-Kontakte prüfen")} value={dueContacts} sub={t("Noch nie geprüft oder letzte Prüfung vor mindestens {0} Tagen", CONTACT_CHECK_INTERVAL_DAYS)} onClick={() => open("rg-contacts")} />
        </div>
      </Section>

      <Section title={t("Überblick")}>
        <div className="rg-kpi-grid">
          <KpiTile title={t("Kunden im Register")} value={summary.total} sub={t("Alle importierten und manuell erfassten Kunden")} onClick={() => openRegister("all")} />
          <KpiTile title={t("Freigegebene Fälle")} value={summary.approved} sub={t("Vier-Augen-Prüfung abgeschlossen, mit Sperrschritten")} onClick={() => openRegister("approved")} />
          <KpiTile title={t("Sanktioniert ohne Sperre")} value={summary.noBlock} sub={t("Bestätigte Fälle ohne Sperrschritte")} onClick={() => openRegister("noBlock")} />
          <KpiTile title={t("Sonderkategorie SR")} value={summary.sr} sub={t("SR-Kennzeichen aus dem Kundenbestand")} onClick={() => openRegister("sr")} />
        </div>
      </Section>

      <div className="rg-two-col">
        <Section title={t("Sperren im Zeitverlauf")} sub={year === "all" ? t("Alle erfassten Sperrdaten, nach Jahr") : t("Sperrdaten im Jahr {0}, nach Monat", year)}
          actions={<><Label for="dashboard-year">{t("Jahr im Diagramm")}</Label><Select id="dashboard-year" accessibleName={t("Jahr im Diagramm")} value={year} onChange={(e) => setYear(e.target.value)}>
            <Option value="all">{t("Alle Jahre")}</Option>{summary.years.map((value) => <Option key={value} value={value}>{value}</Option>)}
          </Select></>}>
          {!months.length && <Text>{t("Keine Sperrdaten vorhanden.")}</Text>}
          <div className="rg-columns" role="img" aria-label={t("Sperren im Zeitverlauf: {0}", months.map((m) => `${m.label}: ${m.value}`).join(", "))}>
            {months.map((m) => <div key={m.label} className="rg-column">
              <span className="rg-column-value">{m.value}</span>
              <span className="rg-column-bar" style={{ height: `${(m.value / maxMonth) * 140}px` }} />
              <span className="rg-column-label">{m.label}</span>
            </div>)}
          </div>
        </Section>
        <Section title={t("Nach Sanktionsliste")} sub={t("Fehlende Listen bleiben als nicht angegeben sichtbar")}>
          <BarList label={t("Sperren nach Sanktionsliste")} rows={countBy(partners, (p) => p.sanctionsList)} />
        </Section>
      </div>

      <div className="rg-three-col">
        <Section title={t("Nach Land")}><BarList label={t("Sperren nach Land")} rows={countBy(partners, (p) => p.country)} /></Section>
        <Section title={t("Nach ETS-Kategorie")} sub={t("laut Pocket Guide Export Control, Stand Juli 2026")}>
          <BarList label={t("Sperren nach ETS-Kategorie")} rows={countBy(partners, (p) => p.ets).map((r) => ({ ...r, hint: ETS_INFO[r.label as keyof typeof ETS_INFO] }))} />
        </Section>
        <Section title={t("Offene Sperrschritte nach Art")}>
          <BarList label={t("Offene Sperrschritte nach Art")} rows={countBy(runningSteps, (s) => STEP_DEFS[s].label)} />
        </Section>
      </div>

      <Section title={t("Kunden mit jüngstem Sperrdatum")} actions={<Button design="Transparent" onClick={() => openRegister("all")}>{t("Zum Register")}</Button>}>
        <Table accessibleName={t("Zuletzt übernommene Geschäftspartner")} overflowMode="Popin"
          headerRow={<TableHeaderRow>
            <TableHeaderCell>{t("Geschäftspartner")}</TableHeaderCell>
            <TableHeaderCell importance={1}>{t("Land")}</TableHeaderCell>
            <TableHeaderCell importance={2}>ETS</TableHeaderCell>
            <TableHeaderCell importance={2}>{t("Sperrdatum")}</TableHeaderCell>
            <TableHeaderCell importance={1}>{t("Sperrschritte")}</TableHeaderCell>
            <TableHeaderCell>{t("Status")}</TableHeaderCell>
          </TableHeaderRow>}>
          {recent.map((p) => {
            const pr = progress(p);
            const status = overallStatus(p);
            return <TableRow key={p.id} rowKey={p.id}>
              <TableCell><Link accessibleRole="Button" onClick={() => open("rg-detail", p.id)}>{p.name}</Link></TableCell>
              <TableCell><Text>{t(p.country)}</Text></TableCell>
              <TableCell><Text>{p.ets}</Text></TableCell>
              <TableCell><Text>{date(p.gtsBlockedAt)}</Text></TableCell>
              <TableCell><Text>{p.decision === "approved" ? t("{0} von {1} erledigt", pr.done, pr.total) : t("keine laufenden Schritte")}</Text></TableCell>
              <TableCell><StatusBadge status={status} /></TableCell>
            </TableRow>;
          })}
        </Table>
      </Section>
    </div>
  </DynamicPage>;
}
