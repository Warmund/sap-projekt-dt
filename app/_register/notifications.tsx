"use client";

import { useState } from "react";
import { Button } from "@ui5/webcomponents-react/Button";
import { CheckBox } from "@ui5/webcomponents-react/CheckBox";
import { Dialog } from "@ui5/webcomponents-react/Dialog";
import { DynamicPage } from "@ui5/webcomponents-react/DynamicPage";
import { DynamicPageTitle } from "@ui5/webcomponents-react/DynamicPageTitle";
import { Link } from "@ui5/webcomponents-react/Link";
import { Table } from "@ui5/webcomponents-react/Table";
import { TableCell } from "@ui5/webcomponents-react/TableCell";
import { TableHeaderCell } from "@ui5/webcomponents-react/TableHeaderCell";
import { TableHeaderRow } from "@ui5/webcomponents-react/TableHeaderRow";
import { TableRow } from "@ui5/webcomponents-react/TableRow";
import { Text } from "@ui5/webcomponents-react/Text";
import { Title } from "@ui5/webcomponents-react/Title";
import { stepStatuses } from "../../lib/register/workflow";
import { useLanguage } from "../language";
import { useRegister } from "./store";
import { Section } from "./ui";

const RECIPIENTS = ["export-control@all.de", "johndoe@mail.de", "janedoe@mail.de"] as const;
type Recipient = typeof RECIPIENTS[number];
type Draft = {
  customers: { id: string; version: number }[];
  recipients: Recipient[];
  subject: string;
  body: string;
};

export function RegisterNotifications() {
  const { t } = useLanguage();
  const { partners, confirmNotifications, reset } = useRegister();
  const [selectedIds, setSelectedIds] = useState(new Set<string>());
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState(false);
  const open = partners.filter((p) => stepStatuses(p).notify === "running");
  const selected = open.filter((p) => selectedIds.has(p.id));

  function toggleCustomer(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function createDraft() {
    const customers = selected.map(({ id, version }) => ({ id, version: version ?? -1 }));
    const entries = selected.map((p) => `- ${p.name} (BP ${p.bpId}, ${t(p.country)})`).join("\n");
    setConfirmError(false);
    setDraft({
      customers,
      recipients,
      subject: t("Information zu gesperrten Geschäftspartnern"),
      body: t("Hallo zusammen,\n\nExport Control hat folgende Geschäftspartner gesperrt:\n\n{0}\n\nDie Sperrschritte sind im Sanktionsregister dokumentiert. Bitte nehmt dazu keinen Kontakt mit den Kunden auf und leitet Anfragen an Export Control weiter.\n\nViele Grüße\nExport Control", entries),
    });
  }

  async function confirm(draft: Draft) {
    setConfirming(true);
    setConfirmError(false);
    try {
      if (await confirmNotifications(draft.customers)) {
        setDraft(null);
        setSelectedIds(new Set());
      } else {
        setConfirmError(true);
      }
    } finally {
      setConfirming(false);
    }
  }

  return <DynamicPage hidePinButton className="app-page"
    titleArea={<DynamicPageTitle heading={<Title level="H1" size="H3">{t("Benachrichtigungen")}</Title>} />}>
    <div className="rg-page">
      <Section title={t("Kunden mit offener Benachrichtigung")}
        sub={t("Hier erscheinen Kunden, sobald der Benachrichtigungsschritt an der Reihe ist.")}
        actions={<Button design="Transparent" onClick={reset}>{t("Daten aktualisieren")}</Button>}>
        <Table accessibleName={t("Kunden mit offener Benachrichtigung")} overflowMode="Popin"
          noDataText={t("Keine Kunden zur Benachrichtigung.")}
          headerRow={<TableHeaderRow>
            <TableHeaderCell width="3.5rem" aria-label={t("Auswahl")} />
            <TableHeaderCell>{t("Geschäftspartner")}</TableHeaderCell>
            <TableHeaderCell>{t("BP-ID (GTS)")}</TableHeaderCell>
            <TableHeaderCell importance={1}>{t("Land")}</TableHeaderCell>
          </TableHeaderRow>}>
          {open.map((p) => <TableRow key={p.id} rowKey={p.id} className="rg-selectable-row" onClick={() => toggleCustomer(p.id)}>
            <TableCell onClick={(event) => event.stopPropagation()}>
              <CheckBox accessibleName={t("{0} auswählen", p.name)} checked={selectedIds.has(p.id)} onChange={() => toggleCustomer(p.id)} />
            </TableCell>
            <TableCell><Text>{p.name}</Text></TableCell>
            <TableCell><Text>{p.bpId}</Text></TableCell>
            <TableCell><Text>{t(p.country)}</Text></TableCell>
          </TableRow>)}
        </Table>
      </Section>

      <Section title={t("Empfänger")}>
        <div className="rg-actions">
          {RECIPIENTS.map((address) => <CheckBox key={address} text={address} checked={recipients.includes(address)}
            onChange={(event) => {
              const checked = event.target.checked;
              setRecipients((current) => checked ? [...current, address] : current.filter((item) => item !== address));
            }} />)}
        </div>
      </Section>
      <div className="rg-actions">
        <Button design="Emphasized" disabled={!selected.length || !recipients.length} onClick={createDraft}>
          {t("Entwurf erstellen")}
        </Button>
      </div>
    </div>

    {draft && <Dialog open headerText={t("E-Mail-Entwurf")} onClose={() => { if (!confirming) setDraft(null); }}
      footer={<div className="rg-dialog-footer">
        <Button disabled={confirming} onClick={() => setDraft(null)}>{t("Schließen")}</Button>
        <Button design="Emphasized" disabled={confirming} onClick={() => confirm(draft)}>{t("Versand bestätigen")}</Button>
      </div>}>
      <div className="rg-mail">
        <Text><b>{t("An:")}</b> {draft.recipients.join(", ")}</Text>
        <Text><b>{t("Betreff:")}</b> {draft.subject}</Text>
        <Text className="rg-pre">{draft.body}</Text>
        <Link href={`mailto:${draft.recipients.join(",")}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`}>
          {t("Im E-Mail-Programm öffnen")}
        </Link>
        <Text>{t("Bestätige den Versand erst, nachdem du die E-Mail verschickt hast.")}</Text>
        {confirmError && <Text>{t("Versandbestätigung fehlgeschlagen. Schließe den Entwurf und aktualisiere die Liste.")}</Text>}
      </div>
    </Dialog>}
  </DynamicPage>;
}
