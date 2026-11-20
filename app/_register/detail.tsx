"use client";
import { translateAudit, translateStepResult } from "../../lib/i18n/messages";
import { canEditWorkspace } from "../../lib/roles";
import { useLanguage } from "../language";
import { Tab } from "@ui5/webcomponents-react/Tab";
import { TabContainer } from "@ui5/webcomponents-react/TabContainer";
import { TagPicker } from "./tag-picker";
import { useState } from "react";
import { DynamicPage } from "@ui5/webcomponents-react/DynamicPage";
import { DynamicPageTitle } from "@ui5/webcomponents-react/DynamicPageTitle";
import { Title } from "@ui5/webcomponents-react/Title";
import { Text } from "@ui5/webcomponents-react/Text";
import { Label } from "@ui5/webcomponents-react/Label";
import { Button } from "@ui5/webcomponents-react/Button";
import { Input } from "@ui5/webcomponents-react/Input";
import { Link } from "@ui5/webcomponents-react/Link";
import { MessageStrip } from "@ui5/webcomponents-react/MessageStrip";
import { Timeline } from "@ui5/webcomponents-react/Timeline";
import { TimelineItem } from "@ui5/webcomponents-react/TimelineItem";
import { Table } from "@ui5/webcomponents-react/Table";
import { TableHeaderRow } from "@ui5/webcomponents-react/TableHeaderRow";
import { TableHeaderCell } from "@ui5/webcomponents-react/TableHeaderCell";
import { TableRow } from "@ui5/webcomponents-react/TableRow";
import { TableCell } from "@ui5/webcomponents-react/TableCell";
import "@ui5/webcomponents-icons/dist/history.js";
import { ETS_INFO } from "../../lib/register/mock-data";
import { AUTO_RESULT, isManualStep, SCG_STEPS, STEP_ORDER, progress, overallStatus, stepStatuses, STEP_DEFS } from "../../lib/register/workflow";
import type { BlockedPartner } from "../../lib/register/types";
import { useRegister } from "./store";
import { Section, StatusBadge, StepBadge } from "./ui";

export function RegisterDetail() {
  const { t, date, dateTime } = useLanguage();
  const { selected: p, role, decide, open, reset, setTags } = useRegister();
  const [tab, setTab] = useState<"workflow" | "master">("workflow");
  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState(false);

  if (!p) return <DynamicPage hidePinButton className="app-page"><MessageStrip hideCloseButton>{t("Kein Datensatz ausgewählt.")}</MessageStrip></DynamicPage>;

  const status = overallStatus(p);
  const st = stepStatuses(p);
  const pr = progress(p);

  const submit = async (decision: "approved" | "sanctionedNoBlock" | "declined") => {
    if (decision !== "approved" && !comment.trim()) { setCommentError(true); return; }
    if (!await decide(p.id, decision, comment.trim())) return;
    setComment(""); setCommentError(false);
  };

  return <DynamicPage hidePinButton className="app-page"
    titleArea={<DynamicPageTitle
      breadcrumbs={<Link accessibleRole="Button" onClick={() => open("rg-register")}>{t("Register")}</Link>}
      heading={<div className="rg-title-row"><Title level="H1" size="H3">{p.name}</Title><StatusBadge status={status} />{p.cloudCustomer && <StatusBadgeCloud />}</div>}
      subheading={<Text>{t("BP")} {p.bpId} · {t(p.country)} · {p.ets} · {(p.sanctionsLists ?? [p.sanctionsList]).map((value) => t(value)).join(", ")} {t("· in GTS gesperrt am")} {p.gtsDateOnly ? date(p.gtsBlockedAt) : dateTime(p.gtsBlockedAt)}</Text>} />}>
    <TabContainer onTabSelect={({ detail }) => setTab(detail.tab.dataset.key === "master" ? "master" : "workflow")}>
      <Tab text={t("Sperrablauf")} data-key="workflow" selected={tab === "workflow"}>
        {tab === "workflow" && <div className="rg-page">
          <div className="rg-actions">
            <Button onClick={reset}>{t("Daten neu laden")}</Button>
          </div>
          {p.decision === "pending" && canEditWorkspace(role) && <section className="rg-approval" aria-labelledby="rg-approval-title">
            <div className="rg-approval-text">
              <Title id="rg-approval-title" level="H2" size="H5">{t("Vier-Augen-Freigabe durch EC Member 2")}</Title>
              <Text>{t("Erfasst von")} {p.enteredBy} {t("(EC Member 1). Mit der Freigabe starten die Sperrschritte.")}</Text>
              <Label for="rg-decision-comment" required={commentError}>{t("Kommentar zur Entscheidung")}</Label>
              <Input id="rg-decision-comment" value={comment} valueState={commentError ? "Negative" : "None"}
                placeholder={t("z. B. nur Zahlungsbeschränkungen, keine Sperre nötig")} onInput={(e) => { setComment(e.target.value); setCommentError(false); }} />
              <Text className="rg-muted">{t("Bei „Sanktioniert ohne Sperre“ und „Ablehnen“ ist ein Kommentar erforderlich.")}</Text>
              {commentError && <MessageStrip design="Negative" hideCloseButton>{t("Gib einen Kommentar ein und wähle die Entscheidung erneut.")}</MessageStrip>}
            </div>
            <div className="rg-approval-buttons">
              <Button design="Positive" onClick={() => submit("approved")}>{t("Freigeben, Sperrschritte starten")}</Button>
              <Button design="Attention" onClick={() => submit("sanctionedNoBlock")}>{t("Sanktioniert ohne Sperre")}</Button>
              <Button design="Negative" onClick={() => submit("declined")}>{t("Ablehnen")}</Button>
            </div>
          </section>}
          {p.decision === "sanctionedNoBlock" && <MessageStrip hideCloseButton design="Critical">
            {t("Sanktioniert ohne Sperre: Der Kunde bleibt im Register unter „Sanktioniert ohne Sperre“ sichtbar. Es laufen keine Sperrschritte.")}
          </MessageStrip>}
          {p.decision === "declined" && <MessageStrip hideCloseButton design="Information">
            {t("Abgelehnt: keine Sperrschritte. Die Entscheidung steht nur im Audit-Trail (Umgang mit SAP final klären).")}
          </MessageStrip>}

          <Section title={t("Sperrschritte mit Status")}
            actions={<>
              <Text className="rg-muted">{p.decision === "approved" ? t("{0} von {1} erledigt", pr.done, pr.total) : p.decision === "pending" ? t("starten nach der Freigabe") : t("keine Sperrschritte")}</Text>
            </>}>
            <ol className="rg-steps">
              <StepRow nr="0" title={t("Sperre in SAP GTS")} system="GTS" status="done" result={`${p.enteredBy} (EC Member 1), ${p.gtsDateOnly ? date(p.gtsBlockedAt) : dateTime(p.gtsBlockedAt)}`} />
              <StepRow nr="1" title={t("Datensatz im Register")} system={t("Register")} status="done" result={t("Automatisch angelegt (im Prototyp von Hand)")} />
              <StepRow nr="2" title={t("Vier-Augen-Freigabe")} system={t("Register")} status={p.decision === "pending" ? "running" : "done"}
                result={p.decision === "pending" ? t("Hinweis über die Dashboard-Kachel „Zur Freigabe“") : `${p.decidedBy} (EC Member 2), ${dateTime(p.decidedAt!)}`} />
              {STEP_ORDER.map((key, index) => {
                const step = STEP_DEFS[key];
                return <li key={key} className="rg-step">
                  <span className="rg-step-nr" aria-hidden="true">{index + 3}</span>
                  <div className="rg-step-body">
                    <StepCard title={t(step.label)} system={t(step.system)} status={st[key]}
                      result={p.completed[key]?.result ?? (st[key] === "running" ? step.runningText : !isManualStep(key) && st[key] === "done" ? AUTO_RESULT : undefined)}
                      note={step.note && t(step.note)} />
                    {key === "scg" && <div className="rg-step-cards">
                      {SCG_STEPS.map((child) => <StepCard key={child} title={t(STEP_DEFS[child].label)}
                        system={t(STEP_DEFS[child].system)} status={st[child]} result={p.completed[child]?.result} />)}
                    </div>}
                  </div>
                </li>;
              })}
            </ol>
          </Section>

          <Section title={t("Freigabe-Nachweis")}>
            <dl className="rg-facts">
              <dt>EC Member 1</dt><dd>{p.enteredBy} · {p.gtsDateOnly ? date(p.gtsBlockedAt) : dateTime(p.gtsBlockedAt)} (GTS)</dd>
              <dt>EC Member 2</dt><dd>{p.decidedBy ? `${p.decidedBy} · ${dateTime(p.decidedAt!)}` : t("offen")}</dd>
              <dt>{t("Entscheidung")}</dt><dd>{decisionText(p, t)}</dd>
            </dl>
          </Section>
          <Section title={t("Verlauf (Audit-Trail)")}>
            <Timeline accessibleName={t("Audit-Trail")}>
              {[...p.audit].reverse().map((e, i) => <TimelineItem key={i} icon="history" titleText={translateAudit(e.text, t)} subtitleText={`${dateTime(e.at)} · ${t(e.by)}`} />)}
            </Timeline>
          </Section>
        </div>}
      </Tab>
      <Tab text={t("Stammdaten")} data-key="master" selected={tab === "master"}>
        {tab === "master" && <div className="rg-page">
          <Section title="Tags">
            <TagPicker key={p.id} ids={p.tags?.map((tag) => tag.id) ?? []}
              onChange={canEditWorkspace(role) ? (ids) => setTags(p.id, ids) : undefined} />
          </Section>
          <Section title={t("Stammdaten")}>
            <dl className="rg-facts">
              <dt>{t("BP-ID (GTS)")}</dt><dd>{p.bpId}</dd>
              <dt>{t("ERP-ID")}</dt><dd>{p.erpId}</dd>
              <dt>{t("Land")}</dt><dd>{t(p.country)}</dd>
              <dt>{t("ETS-Kategorie")}</dt><dd>{p.ets} ({t(ETS_INFO[p.ets])})</dd>
              <dt>{t("Region")}</dt><dd>{p.region || t("Nicht angegeben")}</dd>
              <dt>SPL</dt><dd>{p.spl == null ? t("Nicht angegeben") : p.spl ? t("Ja") : t("Nein")}</dd>
              <dt>RU IT Consultancy Ban</dt><dd>{p.ruItConsultancyBan == null ? t("Nicht angegeben") : p.ruItConsultancyBan ? t("Ja") : t("Nein")}</dd>
              <dt>{t("Ukraine Crisis")}</dt><dd>{p.ukraineCrisis == null ? t("Nicht angegeben") : p.ukraineCrisis ? t("Ja") : t("Nein")}</dd>
              <dt>{t("Sanktionsliste")}</dt><dd>{(p.sanctionsLists ?? [p.sanctionsList]).map((value) => t(value)).join(", ")}</dd>
              {p.listReference && <><dt>{t("Referenz auf Listeneintrag")}</dt><dd>{p.listReference}</dd></>}
              <dt>{t("Cloud-Kunde")}</dt><dd>{p.cloudCustomer ? t("Ja, {0}", p.tenants.length ? t("{0} Tenants", p.tenants.length) : t("Tenant-Daten fehlen")) : t("Nein")}</dd>
              {p.specialComment && <><dt>{t("Kommentar zur Sonderkategorie")}</dt><dd>{p.specialComment}</dd></>}
              <dt>{t("Kommentar")}</dt><dd>{p.comment === "Keine Anmerkungen." ? t(p.comment) : p.comment}</dd>
            </dl>
          </Section>
          {p.cloudCustomer && <Section title={t("Cloud: zu sperrende Tenants")} sub={t("Quelle: [SAP-System, mit SAP klären]. Je LoB ein Ticket über einen einheitlichen Weg, die LoB bestätigt die Sperre im Register.")}>
            {!p.tenants.length && <MessageStrip hideCloseButton design="Critical">{t("Cloud-Kunde laut Quelldatei. Tenant-IDs, Produkte und LoB-Tickets sind noch nicht angegeben.")}</MessageStrip>}
            <Table accessibleName={t("Cloud-Tenants")} overflowMode="Popin"
              headerRow={<TableHeaderRow>
                <TableHeaderCell>Line of Business</TableHeaderCell><TableHeaderCell>{t("Produkt")}</TableHeaderCell>
                <TableHeaderCell>{t("Tenant-ID")}</TableHeaderCell><TableHeaderCell importance={1}>{t("LoB-Ticket")}</TableHeaderCell><TableHeaderCell>{t("Status")}</TableHeaderCell>
              </TableHeaderRow>}>
              {p.tenants.map((tenant) => <TableRow key={tenant.tenantId} rowKey={tenant.tenantId}>
                <TableCell><Text>{tenant.lob}</Text></TableCell><TableCell><Text>{tenant.product}</Text></TableCell>
                <TableCell><Text className="rg-strong">{tenant.tenantId}</Text></TableCell>
                <TableCell><Text>{st.cloud === "running" || st.cloud === "done" ? t(tenant.ticket) : t("noch nicht angelegt")}</Text></TableCell>
                <TableCell><StepBadge status={st.cloud} /></TableCell>
              </TableRow>)}
            </Table>
          </Section>}

        </div>}
      </Tab>
    </TabContainer>

  </DynamicPage>;
}

function StatusBadgeCloud() {
  const { t } = useLanguage();
  return <span className="rg-chip">{t("Cloud-Kunde")}</span>;
}

function StepRow({ nr, ...card }: { nr: string } & Parameters<typeof StepCard>[0]) {
  return <li className="rg-step"><span className="rg-step-nr" aria-hidden="true">{nr}</span><div className="rg-step-body"><div className="rg-step-cards"><StepCard {...card} /></div></div></li>;
}

function StepCard({ title, system, status, result, note }: { title: string; system: string; status: Parameters<typeof StepBadge>[0]["status"]; result?: string; note?: string }) {
  const { t } = useLanguage();
  return <div className={`rg-step-card rg-step-${status}`}>
    <div className="rg-step-card-head"><Text className="rg-strong">{title}</Text><StepBadge status={status} /></div>
    <Text className="rg-muted">{system}</Text>
    {result && <Text>{translateStepResult(result, t)}</Text>}
    {note && <Text className="rg-note">{note}</Text>}
  </div>;
}

function decisionText(p: BlockedPartner, t: ReturnType<typeof useLanguage>["t"]) {
  return t({ pending: "ausstehend", approved: "Freigegeben", sanctionedNoBlock: "Sanktioniert ohne Sperre", declined: "Abgelehnt" }[p.decision])
    + (p.decisionComment ? `: ${p.decisionComment}` : "");
}
