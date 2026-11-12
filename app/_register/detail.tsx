"use client";
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
import { SegmentedButton } from "@ui5/webcomponents-react/SegmentedButton";
import { SegmentedButtonItem } from "@ui5/webcomponents-react/SegmentedButtonItem";
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
import { formatDateTime, PHASES, progress, overallStatus, stepStatuses, STEP_DEFS, VARIANT_LABEL } from "../../lib/register/workflow";
import type { BlockedPartner, StepOrderVariant } from "../../lib/register/types";
import { useRegister } from "./store";
import { Section, StatusBadge, StepBadge } from "./ui";

export function RegisterDetail() {
  const { selected: p, variant, setVariant, decide, advance, contacts, open, reset } = useRegister();
  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState(false);
  const [mailOpen, setMailOpen] = useState(false);

  if (!p) return <DynamicPage hidePinButton className="app-page"><MessageStrip hideCloseButton>Kein Datensatz ausgewählt.</MessageStrip></DynamicPage>;

  const status = overallStatus(p, variant);
  const st = stepStatuses(p, variant);
  const pr = progress(p, variant);
  const canAdvance = p.decision === "approved" && pr.done < pr.total;
  const contact = contacts.find((c) => c.countries.includes(p.country));

  const submit = (decision: "approved" | "sanctionedNoBlock" | "declined") => {
    if (decision !== "approved" && !comment.trim()) { setCommentError(true); return; }
    decide(p.id, decision, comment.trim());
    setComment(""); setCommentError(false);
  };

  const recipients = [
    { role: "Account Executive", name: "[Name aus CRM bzw. ONE360, offen]" },
    { role: `General Director ${contact?.region ?? p.country}`, name: contact?.generalDirector || "[nicht gepflegt]" },
    { role: `Legal Head ${contact?.region ?? p.country}`, name: contact?.legalHead || "[nicht gepflegt]" },
    { role: `Commercial Director ${contact?.region ?? p.country}`, name: contact?.commercialDirector || "[nicht gepflegt]" },
  ];

  return <DynamicPage hidePinButton className="app-page"
    titleArea={<DynamicPageTitle
      breadcrumbs={<Link onClick={() => open("rg-register")}>Register</Link>}
      heading={<div className="rg-title-row"><Title level="H1" size="H3">{p.name}</Title><StatusBadge status={status} />{p.cloudCustomer && <StatusBadgeCloud />}</div>}
      subheading={<Text>BP {p.bpId} · {p.country} · {p.ets} · {p.sanctionsList} · in GTS gesperrt am {formatDateTime(p.gtsBlockedAt)}</Text>}
      actionsBar={<div className="rg-actions">
        <SegmentedButton accessibleName="Diskussionsvariante Schrittfolge" onSelectionChange={(e) => setVariant(e.detail.selectedItems[0]?.dataset.key as StepOrderVariant)}>
          <SegmentedButtonItem data-key="A" selected={variant === "A"} tooltip={VARIANT_LABEL.A}>A: SAP-Folien</SegmentedButtonItem>
          <SegmentedButtonItem data-key="B" selected={variant === "B"} tooltip={VARIANT_LABEL.B}>B: Call 06.11.</SegmentedButtonItem>
        </SegmentedButton>
        <Button design="Transparent" onClick={reset}>Demo zurücksetzen</Button>
      </div>} />}>
    <div className="rg-page">
      {p.decision === "pending" && <section className="rg-approval" aria-labelledby="rg-approval-title">
        <div className="rg-approval-text">
          <Title id="rg-approval-title" level="H2" size="H5">Vier-Augen-Freigabe durch EC Member 2</Title>
          <Text>In GTS gesperrt von {p.enteredBy} (EC Member 1). Erst mit der Freigabe starten die Sperrschritte. Auf offene Freigaben weist nur die Dashboard-Kachel hin, es gibt keine E-Mail.</Text>
          <Label for="rg-decision-comment" required={commentError}>Kommentar zur Entscheidung (Pflicht, wenn nicht freigegeben wird)</Label>
          <Input id="rg-decision-comment" value={comment} valueState={commentError ? "Negative" : "None"}
            placeholder="z. B. nur Zahlungsbeschränkungen, keine Sperre nötig" onInput={(e) => { setComment(e.target.value); setCommentError(false); }} />
        </div>
        <div className="rg-approval-buttons">
          <Button design="Positive" onClick={() => submit("approved")}>Freigeben, Sperrschritte starten</Button>
          <Button design="Attention" onClick={() => submit("sanctionedNoBlock")}>Sanktioniert, ohne Sperrschritte</Button>
          <Button design="Negative" onClick={() => submit("declined")}>Ablehnen</Button>
        </div>
      </section>}
      {p.decision === "sanctionedNoBlock" && <MessageStrip hideCloseButton design="Critical">
        Sanktioniert ohne Sperre: Der Kunde bleibt im Register unter „Sanktioniert ohne Sperre“ sichtbar. Es laufen keine Sperrschritte.
      </MessageStrip>}
      {p.decision === "declined" && <MessageStrip hideCloseButton design="Information">
        Abgelehnt: keine Sperrschritte. Die Entscheidung steht nur im Audit-Trail (Umgang mit SAP final klären).
      </MessageStrip>}

      <div className="rg-detail-grid">
        <div className="rg-detail-main">
          <Section title="Sperrschritte mit Status" sub={VARIANT_LABEL[variant]}
            actions={<>
              <Text className="rg-muted">{p.decision === "approved" ? `${pr.done} von ${pr.total} erledigt` : p.decision === "pending" ? "starten nach der Freigabe" : "keine Sperrschritte"}</Text>
              {canAdvance && <Button onClick={() => advance(p.id)}>Rückmeldung simulieren</Button>}
            </>}>
            <ol className="rg-steps">
              <StepRow nr="0" title="Sperre in SAP GTS" system="GTS" status="done" result={`${p.enteredBy} (EC Member 1), ${formatDateTime(p.gtsBlockedAt)}`} />
              <StepRow nr="1" title="Datensatz im Register" system="Register" status="done" result="Automatisch angelegt (im Prototyp von Hand)" />
              <StepRow nr="2" title="Vier-Augen-Freigabe" system="Register" status={p.decision === "pending" ? "running" : "done"}
                result={p.decision === "pending" ? "Hinweis über die Dashboard-Kachel „Zur Freigabe“" : `${p.decidedBy} (EC Member 2), ${formatDateTime(p.decidedAt!)}`} />
              {PHASES[variant].map((phase, i) => <li key={phase.join("-")} className="rg-step">
                <span className="rg-step-nr" aria-hidden="true">{i + 3}</span>
                <div className="rg-step-body">
                  {phase.length > 1 && <Text className="rg-parallel">Parallel</Text>}
                  <div className="rg-step-cards">
                    {phase.map((k) => <StepCard key={k} title={STEP_DEFS[k].label} system={STEP_DEFS[k].system} status={st[k]}
                      result={p.completed[k]?.result ?? (st[k] === "running" ? STEP_DEFS[k].runningText : undefined)} note={STEP_DEFS[k].note} />)}
                  </div>
                </div>
              </li>)}
            </ol>
          </Section>

          {p.cloudCustomer && <Section title="Cloud: zu sperrende Tenants" sub="Quelle: [SAP-System, mit SAP klären]. Je LoB ein Ticket über einen einheitlichen Weg, die LoB bestätigt die Sperre im Register.">
            <Table accessibleName="Cloud-Tenants" overflowMode="Popin"
              headerRow={<TableHeaderRow>
                <TableHeaderCell>Line of Business</TableHeaderCell><TableHeaderCell>Produkt</TableHeaderCell>
                <TableHeaderCell>Tenant-ID</TableHeaderCell><TableHeaderCell importance={1}>LoB-Ticket</TableHeaderCell><TableHeaderCell>Status</TableHeaderCell>
              </TableHeaderRow>}>
              {p.tenants.map((t) => <TableRow key={t.tenantId} rowKey={t.tenantId}>
                <TableCell><Text>{t.lob}</Text></TableCell><TableCell><Text>{t.product}</Text></TableCell>
                <TableCell><Text className="rg-strong">{t.tenantId}</Text></TableCell>
                <TableCell><Text>{st.cloud === "running" || st.cloud === "done" ? t.ticket : "noch nicht angelegt"}</Text></TableCell>
                <TableCell><StepBadge status={st.cloud} /></TableCell>
              </TableRow>)}
            </Table>
          </Section>}

          <Section title="Benachrichtigung (letzter Schritt)" actions={<Button icon="email" onClick={() => setMailOpen(true)}>E-Mail-Entwurf öffnen</Button>}>
            <div className="rg-recipients">
              {recipients.map((r) => <div key={r.role} className="rg-recipient"><Text className="rg-strong">{r.role}</Text><Text>{r.name}</Text></div>)}
            </div>
            <MessageStrip hideCloseButton design="Negative">Kein Kontakt mit dem Kunden selbst. Bei Sanktionen kann schon die Erklärung der Sperre verboten sein.</MessageStrip>
            <Link onClick={() => open("rg-contacts")}>Länder-Kontakte pflegen</Link>
          </Section>
        </div>

        <aside className="rg-detail-side">
          <Section title="Stammdaten">
            <dl className="rg-facts">
              <dt>BP-ID (GTS)</dt><dd>{p.bpId}</dd>
              <dt>ERP-ID</dt><dd>{p.erpId}</dd>
              <dt>Land</dt><dd>{p.country}</dd>
              <dt>ETS-Kategorie</dt><dd>{p.ets} ({ETS_INFO[p.ets]})</dd>
              <dt>Sanktionsliste</dt><dd>{p.sanctionsList}</dd>
              <dt>Cloud-Kunde</dt><dd>{p.cloudCustomer ? `Ja, ${p.tenants.length} Tenants` : "Nein"}</dd>
              <dt>Sonderkategorie</dt><dd>{p.specialCategory ?? "keine"}{p.specialComment ? `, ${p.specialComment}` : ""}</dd>
              <dt>Kommentar</dt><dd>{p.comment}</dd>
            </dl>
          </Section>
          <Section title="Freigabe-Nachweis">
            <dl className="rg-facts">
              <dt>EC Member 1</dt><dd>{p.enteredBy} · {formatDateTime(p.gtsBlockedAt)} (GTS)</dd>
              <dt>EC Member 2</dt><dd>{p.decidedBy ? `${p.decidedBy} · ${formatDateTime(p.decidedAt!)}` : "offen"}</dd>
              <dt>Entscheidung</dt><dd>{decisionText(p)}</dd>
            </dl>
          </Section>
          <Section title="Verlauf (Audit-Trail)">
            <Timeline accessibleName="Audit-Trail">
              {[...p.audit].reverse().map((e, i) => <TimelineItem key={i} icon="history" titleText={e.text} subtitleText={`${formatDateTime(e.at)} · ${e.by}`} />)}
            </Timeline>
          </Section>
        </aside>
      </div>
    </div>

    <Dialog open={mailOpen} headerText="E-Mail-Entwurf (Platzhalter, kein Versand)" onClose={() => setMailOpen(false)}
      footer={<div className="rg-dialog-footer">
        <Button design="Emphasized" onClick={() => { window.location.href = mailto(p, recipients); }}>Im E-Mail-Programm öffnen</Button>
        <Button design="Transparent" onClick={() => setMailOpen(false)}>Schließen</Button>
      </div>}>
      <div className="rg-mail">
        <Text><b>An:</b> {recipients.slice(0, 3).map((r) => `[${r.role}]`).join("; ")}</Text>
        <Text><b>Cc:</b> [{recipients[3].role}], Export Control</Text>
        <Text><b>Betreff:</b> {mailSubject(p)}</Text>
        <Text className="rg-pre">{mailBody(p)}</Text>
      </div>
    </Dialog>
  </DynamicPage>;
}

function StatusBadgeCloud() {
  return <span className="rg-chip">Cloud-Kunde</span>;
}

function StepRow({ nr, ...card }: { nr: string } & Parameters<typeof StepCard>[0]) {
  return <li className="rg-step"><span className="rg-step-nr" aria-hidden="true">{nr}</span><div className="rg-step-body"><div className="rg-step-cards"><StepCard {...card} /></div></div></li>;
}

function StepCard({ title, system, status, result, note }: { title: string; system: string; status: Parameters<typeof StepBadge>[0]["status"]; result?: string; note?: string }) {
  return <div className={`rg-step-card rg-step-${status}`}>
    <div className="rg-step-card-head"><Text className="rg-strong">{title}</Text><StepBadge status={status} /></div>
    <Text className="rg-muted">{system}</Text>
    {result && <Text>{result}</Text>}
    {note && <Text className="rg-note">{note}</Text>}
  </div>;
}

function decisionText(p: BlockedPartner) {
  return { pending: "ausstehend", approved: "Freigegeben", sanctionedNoBlock: "Sanktioniert ohne Sperre", declined: "Abgelehnt" }[p.decision]
    + (p.decisionComment ? `: ${p.decisionComment}` : "");
}

const mailSubject = (p: BlockedPartner) => `Information: Geschäftspartner ${p.name} (BP ${p.bpId}) gesperrt`;
const mailBody = (p: BlockedPartner) => `Hallo zusammen,

der Geschäftspartner ${p.name} (BP ${p.bpId}, ${p.country}) wurde von Export Control gesperrt. Die Sperrschritte sind im Sanktionsregister dokumentiert.
Bitte nehmt zu diesem Thema keinen Kontakt mit dem Kunden auf und leitet Anfragen an Export Control weiter.

Viele Grüße
Export Control`;

/** Öffnet das E-Mail-Programm mit Platzhaltern statt echter Adressen. */
function mailto(p: BlockedPartner, recipients: { role: string }[]) {
  const to = `An: ${recipients.slice(0, 3).map((r) => `[${r.role}]`).join("; ")}\n\n`;
  return `mailto:?subject=${encodeURIComponent(mailSubject(p))}&body=${encodeURIComponent(to + mailBody(p))}`;
}
