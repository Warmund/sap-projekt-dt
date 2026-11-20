"use client";
import { canEditWorkspace } from "../../lib/roles";
import { useLanguage } from "../language";
import { useState } from "react";
import { Text } from "@ui5/webcomponents-react/Text";
import { Button } from "@ui5/webcomponents-react/Button";
import { Input } from "@ui5/webcomponents-react/Input";
import { Label } from "@ui5/webcomponents-react/Label";
import { Dialog } from "@ui5/webcomponents-react/Dialog";
import { MessageStrip } from "@ui5/webcomponents-react/MessageStrip";
import { ObjectStatus } from "@ui5/webcomponents-react/ObjectStatus";
import { Table } from "@ui5/webcomponents-react/Table";
import { TableHeaderRow } from "@ui5/webcomponents-react/TableHeaderRow";
import { TableHeaderCell } from "@ui5/webcomponents-react/TableHeaderCell";
import { TableRow } from "@ui5/webcomponents-react/TableRow";
import { TableCell } from "@ui5/webcomponents-react/TableCell";
import "@ui5/webcomponents-icons/dist/edit.js";
import { CONTACT_CHECK_INTERVAL_DAYS, daysSince } from "../../lib/register/workflow";
import type { CountryContact } from "../../lib/register/types";
import { useRegister } from "./store";

export function RegisterContacts() {
  const { t, date } = useLanguage();
  const { contacts, role, updateContact } = useRegister();
  const canEdit = canEditWorkspace(role);
  const [editing, setEditing] = useState<CountryContact | null>(null);

  const save = async () => {
    if (!editing) return;
    if (!await updateContact(editing)) return;
    setEditing(null);
  };
  const set = (field: keyof CountryContact, value: string) =>
    setEditing((c) => c && { ...c, [field]: field === "countries" ? value.split(",").map((s) => s.trim()).filter(Boolean) : value });

  return <>
    <div className="rg-page">
      <div className="rg-info-grid">
        <MessageStrip hideCloseButton design="Information">{t("Kontakte werden manuell gepflegt. Für einen späteren Import müssen Datenquelle und Zugriff auf Personendaten geklärt sein.")}</MessageStrip>
        <MessageStrip hideCloseButton design="Critical">{t("Prüfung alle")} {CONTACT_CHECK_INTERVAL_DAYS} {t("Tage. Fällige Regionen erscheinen auf dem Dashboard. Intervall mit SAP bestätigen.")}</MessageStrip>
        <MessageStrip hideCloseButton design="Negative">{t("Nie den Kunden selbst kontaktieren. Bei Sanktionen kann schon die Erklärung der Sperre verboten sein.")}</MessageStrip>
      </div>
      <Table accessibleName={t("Länder-Kontakte")} overflowMode="Popin"
        headerRow={<TableHeaderRow sticky>
          <TableHeaderCell>{t("Region")}</TableHeaderCell>
          <TableHeaderCell importance={1}>{t("Länder")}</TableHeaderCell>
          <TableHeaderCell>General Director</TableHeaderCell>
          <TableHeaderCell>Legal Head</TableHeaderCell>
          <TableHeaderCell importance={1}>Commercial Director</TableHeaderCell>
          <TableHeaderCell importance={1}>{t("Geprüft am")}</TableHeaderCell>
          <TableHeaderCell>{t("Status")}</TableHeaderCell>
          {canEdit && <TableHeaderCell><span className="rg-sr-only">{t("Aktion")}</span></TableHeaderCell>}
        </TableHeaderRow>}>
        {contacts.map((c) => {
          const due = !c.lastChecked || daysSince(c.lastChecked) >= CONTACT_CHECK_INTERVAL_DAYS;
          return <TableRow key={c.id} rowKey={c.id}>
            <TableCell><Text className="rg-strong">{c.region}</Text></TableCell>
            <TableCell><Text>{c.countries.map((country) => t(country)).join(", ")}</Text></TableCell>
            <TableCell><Text>{c.generalDirector || t("[offen]")}</Text></TableCell>
            <TableCell><Text>{c.legalHead || t("[offen]")}</Text></TableCell>
            <TableCell><Text>{c.commercialDirector || t("[offen]")}</Text></TableCell>
            <TableCell><Text>{c.lastChecked ? date(c.lastChecked) : t("Noch nicht geprüft")}</Text></TableCell>
            <TableCell><ObjectStatus inverted state={due ? "Critical" : "Positive"}>{due ? t("Prüfung fällig") : t("Aktuell")}</ObjectStatus></TableCell>
            {canEdit && <TableCell><Button icon="edit" design="Transparent" accessibleName={t("{0} bearbeiten", c.region)} onClick={() => setEditing(c)}>{t("Bearbeiten")}</Button></TableCell>}
          </TableRow>;
        })}
      </Table>
      <Text className="rg-muted">{t("Länder sind teils zu Regionen zusammengefasst, z. B. Iberia für Spanien und Portugal. Bei einer Sperre zieht das Register die Kontakte über das Land des Kunden.")}</Text>
    </div>

    <Dialog open={!!editing} headerText={editing ? t("Region {0} bearbeiten", editing.region) : ""} onClose={() => setEditing(null)}
      footer={<div className="rg-dialog-footer">
        <Button design="Emphasized" onClick={save}>{t("Speichern und als geprüft markieren")}</Button>
        <Button design="Transparent" onClick={() => setEditing(null)}>{t("Abbrechen")}</Button>
      </div>}>
      {editing && <div className="rg-dialog-form">
        <Field id="c-gd" label="General Director" value={editing.generalDirector} onInput={(v) => set("generalDirector", v)} />
        <Field id="c-lh" label="Legal Head" value={editing.legalHead} onInput={(v) => set("legalHead", v)} />
        <Field id="c-cd" label="Commercial Director" value={editing.commercialDirector} onInput={(v) => set("commercialDirector", v)} />
        <Field id="c-la" label={t("Länder der Region (kommagetrennt)")} value={editing.countries.join(", ")} onInput={(v) => set("countries", v)} />
      </div>}
    </Dialog>
  </>;
}

function Field({ id, label, value, onInput }: { id: string; label: string; value: string; onInput: (v: string) => void }) {
  return <div className="rg-field"><Label for={id}>{label}</Label><Input id={id} value={value} onInput={(e) => onInput(e.target.value)} /></div>;
}
