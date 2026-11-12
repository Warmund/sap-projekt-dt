"use client";
import { useState } from "react";
import { DynamicPage } from "@ui5/webcomponents-react/DynamicPage";
import { DynamicPageTitle } from "@ui5/webcomponents-react/DynamicPageTitle";
import { Title } from "@ui5/webcomponents-react/Title";
import { Text } from "@ui5/webcomponents-react/Text";
import { Button } from "@ui5/webcomponents-react/Button";
import { Link } from "@ui5/webcomponents-react/Link";
import { MessageStrip } from "@ui5/webcomponents-react/MessageStrip";
import { SegmentedButton } from "@ui5/webcomponents-react/SegmentedButton";
import { SegmentedButtonItem } from "@ui5/webcomponents-react/SegmentedButtonItem";
import { IllustratedMessage } from "@ui5/webcomponents-react/IllustratedMessage";
import "@ui5/webcomponents-fiori/dist/illustrations/NoTasks.js";
import { formatDate, stepStatuses, STEP_DEFS } from "../../lib/register/workflow";
import type { StepKey } from "../../lib/register/types";
import { useRegister } from "./store";
import { StepBadge } from "./ui";

const TEAMS: { key: StepKey; label: string }[] = [
  { key: "cloud", label: "Cloud-LoB" },
  { key: "tickets", label: "Support (Tickets)" },
  { key: "remote", label: "Remote-Support" },
  { key: "suser", label: "S-User-Team (W7)" },
];

/** Sicht einer Nachbarabteilung: nur eigene Schritte, nur Erledigung bestätigen. */
export function RegisterTasks() {
  const { partners, variant, completeStep, open } = useRegister();
  const [team, setTeam] = useState<StepKey>("cloud");

  const tasks = partners
    .filter((p) => p.decision === "approved")
    .map((p) => ({ p, status: stepStatuses(p, variant)[team] }))
    .filter((t) => t.status === "running" || t.status === "waiting");

  return <DynamicPage hidePinButton className="app-page"
    titleArea={<DynamicPageTitle heading={<Title level="H1" size="H3">Meine Sperrschritte</Title>}
      subheading={<Text>Sicht einer Nachbarabteilung · {TEAMS.find((t) => t.key === team)?.label}</Text>} />}>
    <div className="rg-page rg-narrow">
      <MessageStrip hideCloseButton design="Information">
        Eingeschränkte Rolle: Nachbarabteilungen sehen nur ihre eigenen Schritte und bestätigen deren Erledigung. Stammdaten, Freigaben und Schritte anderer Teams sind nicht änderbar.
      </MessageStrip>
      <SegmentedButton accessibleName="Team (Demo)" onSelectionChange={(e) => setTeam(e.detail.selectedItems[0]?.dataset.key as StepKey)}>
        {TEAMS.map((t) => <SegmentedButtonItem key={t.key} data-key={t.key} selected={team === t.key}>{t.label}</SegmentedButtonItem>)}
      </SegmentedButton>

      {tasks.length === 0
        ? <IllustratedMessage name="NoTasks" titleText="Keine offenen Schritte" subtitleText="Für dieses Team ist gerade nichts zu tun." />
        : tasks.map(({ p, status }) => <article key={p.id} className="rg-task">
          <div className="rg-task-text">
            <div className="rg-title-row"><Title level="H2" size="H5">{STEP_DEFS[team].label}</Title><StepBadge status={status} /></div>
            <Text><Link onClick={() => open("rg-detail", p.id)}>{p.name}</Link> · {detailFor(team, p.tenants.map((t) => `${t.tenantId} (${t.product})`))}</Text>
            <Text className="rg-muted">{status === "waiting" ? waitingText(team) : `Freigegeben am ${formatDate(p.decidedAt!)}`}</Text>
          </div>
          {status === "running" && <div className="rg-actions">
            <Button design="Transparent">Rückfrage an Export Control</Button>
            {team === "tickets" && <Button onClick={() => completeStep(p.id, "tickets", "Keine offenen Tickets vorhanden")}>Keine Tickets vorhanden</Button>}
            <Button design="Positive" onClick={() => completeStep(p.id, team)}>Erledigung bestätigen</Button>
          </div>}
        </article>)}

      <Text className="rg-muted">Eingang im Zielbild über einen einheitlichen Weg für alle Teams und LoBs, z. B. eine E-Mail, die automatisch ein Ticket erzeugt. Die Bestätigung hier ersetzt die Antwort per E-Mail und die eigene Excel-Liste.</Text>
    </div>
  </DynamicPage>;
}

function detailFor(team: StepKey, tenants: string[]) {
  switch (team) {
    case "cloud": return tenants.join(", ");
    case "tickets": return "offene Tickets in ServiceNow und BCP prüfen und schließen";
    case "remote": return "RCSC-Zugang und Secure Support";
    default: return "S-User in W7";
  }
}

function waitingText(team: StepKey) {
  return team === "remote" ? "Startet, sobald alle Tickets geschlossen sind" : "Wartet auf vorherige Sperrschritte";
}
