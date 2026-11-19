"use client";
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
import { CONTACT_CHECK_INTERVAL_DAYS, formatDate, overallStatus, progress, STEP_DEFS } from "../../lib/register/workflow";
import { useRegister } from "./store";
import { BarList, countBy, KpiTile, Section, StatusBadge } from "./ui";

export function RegisterDashboard() {
  const { partners, contacts, open, openRegister, reset } = useRegister();
  const [year, setYear] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const summary = dashboardSummary(partners, contacts);
  const { runningSteps, dueContacts } = summary;
  const months = blockingTimeline(partners, year);
  const maxMonth = Math.max(1, ...months.map((m) => m.value));
  const refresh = async () => {
    setRefreshing(true);
    try { await reset(); } finally { setRefreshing(false); }
  };
  const recent = [...partners].sort((a, b) => b.gtsBlockedAt.localeCompare(a.gtsBlockedAt)).slice(0, 6);

  return <DynamicPage hidePinButton className="app-page"
    titleArea={<DynamicPageTitle heading={<Title level="H1" size="H3">Sanktionsregister</Title>}
      subheading={<Text>Kundenbestand, offene Freigaben und Status der Sperrschritte</Text>} />}>
    <div className="rg-page">
      <div className="rg-actions"><Button onClick={refresh} disabled={refreshing}>{refreshing ? "Registerdaten werden geladen …" : "Daten aktualisieren"}</Button></div>
      <Section title="Handlungsbedarf">
        <div className="rg-kpi-grid">
          <KpiTile tone="approval" title="Zur Freigabe" value={summary.pending} sub="Fälle für die Vier-Augen-Freigabe öffnen"
            onClick={() => openRegister("pending")} />
          <KpiTile tone="warning" title="Offene Sperrschritte" value={runningSteps.length} sub="Laufende und wartende Schritte" onClick={() => openRegister("open")} />
          <KpiTile tone="info" title="Cloud-Kunden ohne Tenant-Daten" value={summary.cloudMissing} sub="Tenant-IDs und LoB-Zuordnung ergänzen" onClick={() => openRegister("cloudMissing")} />
          <KpiTile tone="warning" title="Länder-Kontakte prüfen" value={dueContacts} sub={`Noch nie geprüft oder letzte Prüfung vor mindestens ${CONTACT_CHECK_INTERVAL_DAYS} Tagen`} onClick={() => open("rg-contacts")} />
        </div>
      </Section>

      <Section title="Überblick">
        <div className="rg-kpi-grid">
          <KpiTile title="Kunden im Register" value={summary.total} sub="Alle importierten und manuell erfassten Kunden" onClick={() => openRegister("all")} />
          <KpiTile title="Freigegebene Fälle" value={summary.approved} sub="Vier-Augen-Prüfung abgeschlossen, mit Sperrschritten" onClick={() => openRegister("approved")} />
          <KpiTile title="Sanktioniert ohne Sperre" value={summary.noBlock} sub="Bestätigte Fälle ohne Sperrschritte" onClick={() => openRegister("noBlock")} />
          <KpiTile title="Sonderkategorie SR" value={summary.sr} sub="SR-Kennzeichen aus dem Kundenbestand" onClick={() => openRegister("sr")} />
        </div>
      </Section>

      <div className="rg-two-col">
        <Section title="Sperren im Zeitverlauf" sub={year === "all" ? "Alle erfassten Sperrdaten, nach Jahr" : `Sperrdaten im Jahr ${year}, nach Monat`}
          actions={<><Label for="dashboard-year">Jahr im Diagramm</Label><Select id="dashboard-year" accessibleName="Jahr im Diagramm" value={year} onChange={(e) => setYear(e.target.value)}>
            <Option value="all">Alle Jahre</Option>{summary.years.map((value) => <Option key={value} value={value}>{value}</Option>)}
          </Select></>}>
          {!months.length && <Text>Keine Sperrdaten vorhanden.</Text>}
          <div className="rg-columns" role="img" aria-label={`Sperren im Zeitverlauf: ${months.map((m) => `${m.label}: ${m.value}`).join(", ")}`}>
            {months.map((m) => <div key={m.label} className="rg-column">
              <span className="rg-column-value">{m.value}</span>
              <span className="rg-column-bar" style={{ height: `${(m.value / maxMonth) * 140}px` }} />
              <span className="rg-column-label">{m.label}</span>
            </div>)}
          </div>
        </Section>
        <Section title="Nach Sanktionsliste" sub="Fehlende Listen bleiben als nicht angegeben sichtbar">
          <BarList label="Sperren nach Sanktionsliste" rows={countBy(partners, (p) => p.sanctionsList)} />
        </Section>
      </div>

      <div className="rg-three-col">
        <Section title="Nach Land"><BarList label="Sperren nach Land" rows={countBy(partners, (p) => p.country)} /></Section>
        <Section title="Nach ETS-Kategorie" sub="laut Pocket Guide Export Control, Stand Juli 2026">
          <BarList label="Sperren nach ETS-Kategorie" rows={countBy(partners, (p) => p.ets).map((r) => ({ ...r, hint: ETS_INFO[r.label as keyof typeof ETS_INFO] }))} />
        </Section>
        <Section title="Offene Sperrschritte nach Art">
          <BarList label="Offene Sperrschritte nach Art" rows={countBy(runningSteps, (s) => STEP_DEFS[s].label).map((r) => r)} />
        </Section>
      </div>

      <Section title="Kunden mit jüngstem Sperrdatum" actions={<Button design="Transparent" onClick={() => openRegister("all")}>Zum Register</Button>}>
        <Table accessibleName="Zuletzt übernommene Geschäftspartner" overflowMode="Popin"
          headerRow={<TableHeaderRow>
            <TableHeaderCell>Geschäftspartner</TableHeaderCell>
            <TableHeaderCell importance={1}>Land</TableHeaderCell>
            <TableHeaderCell importance={2}>ETS</TableHeaderCell>
            <TableHeaderCell importance={2}>Sperrdatum</TableHeaderCell>
            <TableHeaderCell importance={1}>Sperrschritte</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
          </TableHeaderRow>}>
          {recent.map((p) => {
            const pr = progress(p);
            const status = overallStatus(p);
            return <TableRow key={p.id} rowKey={p.id}>
              <TableCell><Link accessibleRole="Button" onClick={() => open("rg-detail", p.id)}>{p.name}</Link></TableCell>
              <TableCell><Text>{p.country}</Text></TableCell>
              <TableCell><Text>{p.ets}</Text></TableCell>
              <TableCell><Text>{formatDate(p.gtsBlockedAt)}</Text></TableCell>
              <TableCell><Text>{p.decision === "approved" ? `${pr.done} von ${pr.total} erledigt` : "keine laufenden Schritte"}</Text></TableCell>
              <TableCell><StatusBadge status={status} /></TableCell>
            </TableRow>;
          })}
        </Table>
      </Section>
    </div>
  </DynamicPage>;
}
