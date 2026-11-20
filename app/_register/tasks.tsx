"use client";
import { canCompleteStep } from "../../lib/roles";
import { useState } from "react";
import { Select } from "@ui5/webcomponents-react/Select";
import { Option } from "@ui5/webcomponents-react/Option";
import { useLanguage } from "../language";
import { DynamicPage } from "@ui5/webcomponents-react/DynamicPage";
import { DynamicPageTitle } from "@ui5/webcomponents-react/DynamicPageTitle";
import { Title } from "@ui5/webcomponents-react/Title";
import { Text } from "@ui5/webcomponents-react/Text";
import { Button } from "@ui5/webcomponents-react/Button";
import { Link } from "@ui5/webcomponents-react/Link";
import { MessageStrip } from "@ui5/webcomponents-react/MessageStrip";
import { stepStatuses, STEP_DEFS, MANUAL_STEPS, SCG_STEPS } from "../../lib/register/workflow";
import { useRegister } from "./store";
import { Section, StepBadge } from "./ui";

/** Sicht einer Nachbarabteilung: nur eigene Schritte, nur Erledigung bestätigen. */
export function RegisterTasks() {
  const { t, date } = useLanguage();
  const { partners, role, completeStep, open } = useRegister();

  const [group, setGroup] = useState<"scg" | "cloud">("scg");
  const steps = group === "scg" ? SCG_STEPS : ["cloud"] as const;

  const tasks = partners
    .filter((p) => p.decision === "approved")
    .map((p) => ({ p, statuses: stepStatuses(p) }));

  return <DynamicPage hidePinButton className="app-page"
    titleArea={<DynamicPageTitle heading={<Title level="H1" size="H3">{t("Meine Sperrschritte")}</Title>}
      subheading={<Text>Partner Teams</Text>} />}>
    <div className="rg-page rg-narrow">
      <MessageStrip hideCloseButton design="Information">
        {t("Partner Teams bestätigen hier die manuellen Sperrschritte.")}
      </MessageStrip>
      <Select accessibleName={t("Sperrschritt (Demo)")} value={group}
        onChange={(event) => setGroup(event.target.value === "cloud" ? "cloud" : "scg")}>
        {MANUAL_STEPS.map((step) => <Option key={step} value={step}>{t(STEP_DEFS[step].label)}</Option>)}
      </Select>
      {steps.map((step) => {
        const definition = STEP_DEFS[step];
        const openTasks = tasks
          .map(({ p, statuses }) => ({ p, status: statuses[step] }))
          .filter(({ status }) => status === "running" || status === "waiting");

        return <Section key={step} title={t(definition.label)}>
          {!openTasks.length && <Text>{t("Keine offenen Schritte")}</Text>}
          {openTasks.map(({ p, status }) => <article key={p.id} className="rg-task">
            <div className="rg-task-text">
              <div className="rg-title-row">
                <Link accessibleRole="Button" onClick={() => open("rg-detail", p.id)}>{p.name}</Link>
                <StepBadge status={status} />
              </div>
              <Text>{t(definition.runningText)}{step === "cloud" && p.tenants.length > 0 && ` · ${p.tenants.map((tenant) => `${tenant.tenantId} (${tenant.product})`).join(", ")}`}</Text>
              <Text className="rg-muted">{status === "waiting" ? t("Wartet auf vorherige Sperrschritte") : t("Freigegeben am {0}", date(p.decidedAt!))}</Text>
            </div>
            {status === "running" && canCompleteStep(role, step) && <div className="rg-actions">
              <Button design="Transparent">{t("Rückfrage an Export Control")}</Button>
              <Button design="Positive" onClick={() => completeStep(p.id, step)}>{t("Erledigung bestätigen")}</Button>
            </div>}
          </article>)}
        </Section>;
      })}

      <Text className="rg-muted">{t("Eingang im Zielbild über einen einheitlichen Weg für alle Teams und LoBs, z. B. eine E-Mail, die automatisch ein Ticket erzeugt. Die Bestätigung hier ersetzt die Antwort per E-Mail und die eigene Excel-Liste.")}</Text>
    </div>
  </DynamicPage>;
}
