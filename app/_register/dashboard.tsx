"use client";
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
import { CONTACT_CHECK_INTERVAL_DAYS, daysSince, formatDate, overallStatus, progress, stepStatuses, STEP_DEFS } from "../../lib/register/workflow";
import type { StepKey } from "../../lib/register/types";
import { useRegister } from "./store";
import { BarList, countBy, KpiTile, Section, StatusBadge } from "./ui";

const MONTHS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

export function RegisterDashboard() {
  const { partners, contacts, variant, open } = useRegister();
  const withStatus = partners.map((p) => ({ p, status: overallStatus(p, variant) }));
  const blocked = withStatus.filter((x) => x.status === "Sperrschritte laufen" || x.status === "Abgeschlossen").map((x) => x.p);
  const pending = withStatus.filter((x) => x.status === "Zur Freigabe");
  const noBlock = withStatus.filter((x) => x.status === "Sanktioniert ohne Sperre");
  const runningSteps = partners.flatMap((p) => Object.entries(stepStatuses(p, variant)).filter(([, s]) => s === "running" || s === "waiting").map(([k]) => k as StepKey));
  const openCloud = partners.filter((p) => stepStatuses(p, variant).cloud === "running" || stepStatuses(p, variant).cloud === "waiting").reduce((n, p) => n + p.tenants.length, 0);
  const dueContacts = contacts.filter((c) => daysSince(c.lastChecked) > CONTACT_CHECK_INTERVAL_DAYS).length;

  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const value = blocked.filter((p) => { const g = new Date(p.gtsBlockedAt); return g.getFullYear() === d.getFullYear() && g.getMonth() === d.getMonth(); }).length;
    return { label: `${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`, value };
  });
  const maxMonth = Math.max(1, ...months.map((m) => m.value));
  const recent = [...partners].sort((a, b) => b.gtsBlockedAt.localeCompare(a.gtsBlockedAt)).slice(0, 6);

  return <DynamicPage hidePinButton className="app-page"
    titleArea={<DynamicPageTitle heading={<Title level="H1" size="H3">Sanktionsregister</Title>}
      subheading={<Text>Gesperrte Geschäftspartner, offene Freigaben und Status der Sperrschritte · Mock-Daten</Text>} />}>
    <div className="rg-page">
      <Section title="Handlungsbedarf">
        <div className="rg-kpi-grid">
          <KpiTile tone="approval" title="Zur Freigabe" value={pending.length} sub="Vier-Augen-Prüfung. Hinweis nur über diese Kachel, keine E-Mail."
            onClick={() => open("rg-detail", pending[0]?.p.id)} />
          <KpiTile tone="warning" title="Offene Sperrschritte" value={runningSteps.length} sub="laufend oder wartend" onClick={() => open("rg-register")} />
          <KpiTile tone="info" title="Cloud-Tenants offen" value={openCloud} sub="Sperre je Line of Business" onClick={() => open("rg-tasks")} />
          <KpiTile tone="warning" title="Länder-Kontakte prüfen" value={dueContacts} sub={`Regionen seit über ${CONTACT_CHECK_INTERVAL_DAYS} Tagen nicht geprüft`} onClick={() => open("rg-contacts")} />
        </div>
      </Section>

      <Section title="Überblick">
        <div className="rg-kpi-grid">
          <KpiTile title="Gesperrte Geschäftspartner" value={blocked.length} sub={`davon ${blocked.filter((p) => p.cloudCustomer).length} Cloud-Kunden`} />
          <KpiTile title="Neue Sperren im Vormonat" value={months[4].value} sub={`aktueller Monat: ${months[5].value}`} />
          <KpiTile title="Sanktioniert ohne Sperre" value={noBlock.length} sub="z. B. ETS5 mit reinen Zahlungsbeschränkungen" onClick={() => open("rg-register")} />
          <KpiTile title="Sonderkategorie SR" value={partners.filter((p) => p.specialCategory === "SR").length} sub="eigene Kachel laut SAP-Folie, Definition offen" />
        </div>
      </Section>

      <div className="rg-two-col">
        <Section title="Neue Sperren pro Monat" sub="letzte 6 Monate">
          <div className="rg-columns" role="img" aria-label="Säulendiagramm neue Sperren pro Monat">
            {months.map((m) => <div key={m.label} className="rg-column">
              <span className="rg-column-value">{m.value}</span>
              <span className="rg-column-bar" style={{ height: `${(m.value / maxMonth) * 140}px` }} />
              <span className="rg-column-label">{m.label}</span>
            </div>)}
          </div>
        </Section>
        <Section title="Nach Sanktionsliste bzw. Sperrgrund">
          <BarList label="Sperren nach Sanktionsliste" rows={countBy(blocked, (p) => p.sanctionsList)} />
        </Section>
      </div>

      <div className="rg-three-col">
        <Section title="Nach Land"><BarList label="Sperren nach Land" rows={countBy(blocked, (p) => p.country)} /></Section>
        <Section title="Nach ETS-Kategorie" sub="laut Pocket Guide Export Control, Stand Juli 2026">
          <BarList label="Sperren nach ETS-Kategorie" rows={countBy(blocked, (p) => p.ets).map((r) => ({ ...r, hint: ETS_INFO[r.label as keyof typeof ETS_INFO] }))} />
        </Section>
        <Section title="Offene Sperrschritte nach Art">
          <BarList label="Offene Sperrschritte nach Art" rows={countBy(runningSteps, (s) => STEP_DEFS[s].label).map((r) => r)} />
        </Section>
      </div>

      <Section title="Zuletzt aus GTS übernommen" actions={<Button design="Transparent" onClick={() => open("rg-register")}>Zum Register</Button>}>
        <Table accessibleName="Zuletzt übernommene Geschäftspartner" overflowMode="Popin"
          headerRow={<TableHeaderRow>
            <TableHeaderCell>Geschäftspartner</TableHeaderCell>
            <TableHeaderCell importance={1}>Land</TableHeaderCell>
            <TableHeaderCell importance={2}>ETS</TableHeaderCell>
            <TableHeaderCell importance={2}>GTS-Sperre</TableHeaderCell>
            <TableHeaderCell importance={1}>Sperrschritte</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
          </TableHeaderRow>}>
          {recent.map((p) => {
            const pr = progress(p, variant);
            const status = overallStatus(p, variant);
            return <TableRow key={p.id} rowKey={p.id}>
              <TableCell><Link onClick={() => open("rg-detail", p.id)}>{p.name}</Link></TableCell>
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
