"use client";
import { translateAudit, translateStepResult } from "../../lib/i18n/messages";
import { useLanguage } from "../language";
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
import { Select } from "@ui5/webcomponents-react/Select";
import { Option } from "@ui5/webcomponents-react/Option";
import { Dialog } from "@ui5/webcomponents-react/Dialog";
import { Timeline } from "@ui5/webcomponents-react/Timeline";
import { TimelineItem } from "@ui5/webcomponents-react/TimelineItem";
import { Table } from "@ui5/webcomponents-react/Table";
import { TableHeaderRow } from "@ui5/webcomponents-react/TableHeaderRow";
import { TableHeaderCell } from "@ui5/webcomponents-react/TableHeaderCell";
import { TableRow } from "@ui5/webcomponents-react/TableRow";
import { TableCell } from "@ui5/webcomponents-react/TableCell";
import "@ui5/webcomponents-icons/dist/email.js";
import "@ui5/webcomponents-icons/dist/history.js";
import { ETS_INFO } from "../../lib/register/mock-data";
import { PHASES, progress, overallStatus, stepStatuses, STEP_DEFS, VARIANT_LABEL } from "../../lib/register/workflow";
import type { BlockedPartner } from "../../lib/register/types";
import { useRegister } from "./store";
import { Section, StatusBadge, StepBadge } from "./ui";

export function RegisterDetail() {
  const { t, date, dateTime } = useLanguage();
  const { selected: p, setStepOrder, decide, advance, contacts, open, reset } = useRegister();
  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState(false);
  const [mailOpen, setMailOpen] = useState(false);

  if (!p) return <DynamicPage hidePinButton className="app-page"><MessageStrip hideCloseButton>{t("Kein Datensatz ausgewählt.")}</MessageStrip></DynamicPage>;

  const status = overallStatus(p);
  const st = stepStatuses(p);
  const pr = progress(p);
  const canAdvance = p.decision === "approved" && pr.done < pr.total;
  const contact = contacts.find((c) => c.countries.includes(p.country));

  const submit = async (decision: "approved" | "sanctionedNoBlock" | "declined") => {
    if (decision !== "approved" && !comment.trim()) { setCommentError(true); return; }
    if (!await decide(p.id, decision, comment.trim())) return;
    setComment(""); setCommentError(false);
  };

  const recipients = [
    { role: "Account Executive", name: t("[Name aus CRM bzw. ONE360, offen]") },
    { role: `General Director ${contact?.region ?? p.country}`, name: contact?.generalDirector || t("[nicht gepflegt]") },
    { role: `Legal Head ${contact?.region ?? p.country}`, name: contact?.legalHead || t("[nicht gepflegt]") },
    { role: `Commercial Director ${contact?.region ?? p.country}`, name: contact?.commercialDirector || t("[nicht gepflegt]") },
  ];

  return <DynamicPage hidePinButton className="app-page"
    titleArea={<DynamicPageTitle
      breadcrumbs={<Link accessibleRole="Button" onClick={() => open("rg-register")}>{t("Register")}</Link>}
      heading={<div className="rg-title-row"><Title level="H1" size="H3">{p.name}</Title><StatusBadge status={status} />{p.cloudCustomer && <StatusBadgeCloud />}</div>}
      subheading={<Text>{t("BP")} {p.bpId} · {t(p.country)} · {p.ets} · {t(p.sanctionsList)} {t("· in GTS gesperrt am")} {p.gtsDateOnly ? date(p.gtsBlockedAt) : dateTime(p.gtsBlockedAt)}</Text>} />}>
    <div className="rg-page">
      <div className="rg-actions">
        <Button onClick={reset}>{t("Daten neu laden")}</Button>
      </div>
      {p.decision === "pending" && <section className="rg-approval" aria-labelledby="rg-approval-title">
        <div className="rg-approval-text">
          <Title id="rg-approval-title" level="H2" size="H5">{t("Vier-Augen-Freigabe durch EC Member 2")}</Title>
          <Text>{t("Erfasst von")} {p.enteredBy} {t("(EC Member 1). Mit der Freigabe starten die Sperrschritte.")}</Text>
          <Label for="rg-step-order">{t("Schrittfolge")}</Label>
          <Select id="rg-step-order" accessibleName={t("Schrittfolge")} value={p.stepOrder} onChange={(e) => {
            const value = e.target.value;
            e.target.value = p.stepOrder;
            if (value === "A" || value === "B") void setStepOrder(p.id, value);
          }}>
            <Option value="A">{t("A: S-User zuerst")}</Option>
            <Option value="B">{t("B: Tickets zuerst")}</Option>
          </Select>
          <Text className="rg-muted">{t("Die Schrittfolge wird für diesen Fall gespeichert. Sobald du entschieden hast, ist sie festgelegt.")}</Text>
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

      <div className="rg-detail-grid">
        <div className="rg-detail-main">
          <Section title={t("Sperrschritte mit Status")} sub={t(VARIANT_LABEL[p.stepOrder])}
            actions={<>
              <Text className="rg-muted">{p.decision === "approved" ? t("{0} von {1} erledigt", pr.done, pr.total) : p.decision === "pending" ? t("starten nach der Freigabe") : t("keine Sperrschritte")}</Text>
              {canAdvance && <Button onClick={() => advance(p.id)}>{t("Rückmeldung simulieren")}</Button>}
            </>}>
            <ol className="rg-steps">
              <StepRow nr="0" title={t("Sperre in SAP GTS")} system="GTS" status="done" result={`${p.enteredBy} (EC Member 1), ${p.gtsDateOnly ? date(p.gtsBlockedAt) : dateTime(p.gtsBlockedAt)}`} />
              <StepRow nr="1" title={t("Datensatz im Register")} system={t("Register")} status="done" result={t("Automatisch angelegt (im Prototyp von Hand)")} />
              <StepRow nr="2" title={t("Vier-Augen-Freigabe")} system={t("Register")} status={p.decision === "pending" ? "running" : "done"}
                result={p.decision === "pending" ? t("Hinweis über die Dashboard-Kachel „Zur Freigabe“") : `${p.decidedBy} (EC Member 2), ${dateTime(p.decidedAt!)}`} />
              {PHASES[p.stepOrder].map((phase, i) => <li key={phase.join("-")} className="rg-step">
                <span className="rg-step-nr" aria-hidden="true">{i + 3}</span>
                <div className="rg-step-body">
                  {phase.length > 1 && <Text className="rg-parallel">Parallel</Text>}
                  <div className="rg-step-cards">
                    {phase.map((k) => <StepCard key={k} title={t(STEP_DEFS[k].label)} system={t(STEP_DEFS[k].system)} status={st[k]}
                      result={p.completed[k]?.result ?? (st[k] === "running" ? STEP_DEFS[k].runningText : undefined)} note={STEP_DEFS[k].note && t(STEP_DEFS[k].note!)} />)}
                  </div>
                </div>
              </li>)}
            </ol>
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

          <Section title={t("Benachrichtigung (letzter Schritt)")} actions={<Button icon="email" onClick={() => setMailOpen(true)}>{t("E-Mail-Entwurf öffnen")}</Button>}>
            <div className="rg-recipients">
              {recipients.map((r) => <div key={r.role} className="rg-recipient"><Text className="rg-strong">{t(r.role)}</Text><Text>{r.name}</Text></div>)}
            </div>
            <MessageStrip hideCloseButton design="Negative">{t("Kein Kontakt mit dem Kunden selbst. Bei Sanktionen kann schon die Erklärung der Sperre verboten sein.")}</MessageStrip>
            <Link accessibleRole="Button" onClick={() => open("rg-contacts")}>{t("Länder-Kontakte pflegen")}</Link>
          </Section>
        </div>

        <aside className="rg-detail-side">
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
              <dt>{t("Sanktionsliste")}</dt><dd>{t(p.sanctionsList)}</dd>
              <dt>{t("Cloud-Kunde")}</dt><dd>{p.cloudCustomer ? t("Ja, {0}", p.tenants.length ? t("{0} Tenants", p.tenants.length) : t("Tenant-Daten fehlen")) : t("Nein")}</dd>
              <dt>{t("Sonderkategorie")}</dt><dd>{t(p.specialCategory ?? "keine")}{p.specialComment ? `, ${p.specialComment}` : ""}</dd>
              <dt>{t("Kommentar")}</dt><dd>{p.comment === "Keine Anmerkungen." ? t(p.comment) : p.comment}</dd>
            </dl>
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
        </aside>
      </div>
    </div>

    <Dialog open={mailOpen} headerText={t("E-Mail-Entwurf (Platzhalter, kein Versand)")} onClose={() => setMailOpen(false)}
      footer={<div className="rg-dialog-footer">
        <Button design="Emphasized" onClick={() => { window.location.href = mailto(p, recipients, t); }}>{t("Im E-Mail-Programm öffnen")}</Button>
        <Button design="Transparent" onClick={() => setMailOpen(false)}>{t("Schließen")}</Button>
      </div>}>
      <div className="rg-mail">
        <Text><b>{t("An:")}</b> {recipients.slice(0, 3).map((r) => `[${t(r.role)}]`).join("; ")}</Text>
        <Text><b>{t("Cc:")}</b> [{t(recipients[3].role)}], Export Control</Text>
        <Text><b>{t("Betreff:")}</b> {mailSubject(p, t)}</Text>
        <Text className="rg-pre">{mailBody(p, t)}</Text>
      </div>
    </Dialog>
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

type Translator = ReturnType<typeof useLanguage>["t"];

const mailSubject = (p: BlockedPartner, t: Translator) => t("Information: Geschäftspartner {0} (BP {1}) gesperrt", p.name, p.bpId);
const mailBody = (p: BlockedPartner, t: Translator) => t(`Hallo zusammen,

der Geschäftspartner {0} (BP {1}, {2}) wurde von Export Control gesperrt. Die Sperrschritte sind im Sanktionsregister dokumentiert.
Bitte nehmt zu diesem Thema keinen Kontakt mit dem Kunden auf und leitet Anfragen an Export Control weiter.

Viele Grüße
Export Control`, p.name, p.bpId, t(p.country));

/** Öffnet das E-Mail-Programm mit Platzhaltern statt echter Adressen. */
function mailto(p: BlockedPartner, recipients: { role: string }[], t: Translator) {
  const to = `${t("An:")} ${recipients.slice(0, 3).map((r) => `[${t(r.role)}]`).join("; ")}\n\n`;
  return `mailto:?subject=${encodeURIComponent(mailSubject(p, t))}&body=${encodeURIComponent(to + mailBody(p, t))}`;
}
