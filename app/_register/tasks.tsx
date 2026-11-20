"use client";
import { useLanguage } from "../language";
import { useState } from "react";
import { DynamicPage } from "@ui5/webcomponents-react/DynamicPage";
import { DynamicPageTitle } from "@ui5/webcomponents-react/DynamicPageTitle";
import { Title } from "@ui5/webcomponents-react/Title";
import { Text } from "@ui5/webcomponents-react/Text";
import { Button } from "@ui5/webcomponents-react/Button";
import { Link } from "@ui5/webcomponents-react/Link";
import { MessageStrip } from "@ui5/webcomponents-react/MessageStrip";
import { Select } from "@ui5/webcomponents-react/Select";
import { Option } from "@ui5/webcomponents-react/Option";
import { IllustratedMessage } from "@ui5/webcomponents-react/IllustratedMessage";
import "@ui5/webcomponents-fiori/dist/illustrations/NoTasks.js";
import { stepStatuses, STEP_DEFS, MANUAL_STEPS } from "../../lib/register/workflow";
import type { StepKey } from "../../lib/register/types";
import { useRegister } from "./store";
import { StepBadge } from "./ui";

/** Sicht einer Nachbarabteilung: nur eigene Schritte, nur Erledigung bestätigen. */
export function RegisterTasks() {
  const { t, date } = useLanguage();
  const { partners, completeStep, open } = useRegister();
  const [team, setTeam] = useState<StepKey>("scg");

  const tasks = partners
    .filter((p) => p.decision === "approved")
    .map((p) => ({ p, status: stepStatuses(p)[team] }))
    .filter((t) => t.status === "running" || t.status === "waiting");

  return <DynamicPage hidePinButton className="app-page"
    titleArea={<DynamicPageTitle heading={<Title level="H1" size="H3">{t("Meine Sperrschritte")}</Title>}
      subheading={<Text>{t(STEP_DEFS[team].team)}</Text>} />}>
    <div className="rg-page rg-narrow">
      <MessageStrip hideCloseButton design="Information">
        {t("Partner Teams bestätigen hier die manuellen Sperrschritte.")}
      </MessageStrip>
      <Select accessibleName={t("Sperrschritt (Demo)")} value={team}
        onChange={(event) => setTeam(event.target.value as StepKey)}>
        {MANUAL_STEPS.map((step) => <Option key={step} value={step}>{t(STEP_DEFS[step].label)}</Option>)}
      </Select>

      {tasks.length === 0
        ? <IllustratedMessage name="NoTasks" titleText={t("Keine offenen Schritte")} subtitleText={t("Für dieses Team ist gerade nichts zu tun.")} />
        : tasks.map(({ p, status }) => <article key={p.id} className="rg-task">
          <div className="rg-task-text">
            <div className="rg-title-row"><Title level="H2" size="H5">{t(STEP_DEFS[team].label)}</Title><StepBadge status={status} /></div>
            <Text><Link accessibleRole="Button" onClick={() => open("rg-detail", p.id)}>{p.name}</Link> · {t(STEP_DEFS[team].runningText)}{team === "cloud" && p.tenants.length > 0 && ` · ${p.tenants.map((tenant) => `${tenant.tenantId} (${tenant.product})`).join(", ")}`}</Text>
            <Text className="rg-muted">{status === "waiting" ? t("Wartet auf vorherige Sperrschritte") : t("Freigegeben am {0}", date(p.decidedAt!))}</Text>
          </div>
          {status === "running" && <div className="rg-actions">
            <Button design="Transparent">{t("Rückfrage an Export Control")}</Button>
            <Button design="Positive" onClick={() => completeStep(p.id, team)}>{t("Erledigung bestätigen")}</Button>
          </div>}
        </article>)}

      <Text className="rg-muted">{t("Eingang im Zielbild über einen einheitlichen Weg für alle Teams und LoBs, z. B. eine E-Mail, die automatisch ein Ticket erzeugt. Die Bestätigung hier ersetzt die Antwort per E-Mail und die eigene Excel-Liste.")}</Text>
    </div>
  </DynamicPage>;
}
