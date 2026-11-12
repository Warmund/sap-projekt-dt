"use client";
import { useState } from "react";
import { DynamicPage } from "@ui5/webcomponents-react/DynamicPage";
import { DynamicPageTitle } from "@ui5/webcomponents-react/DynamicPageTitle";
import { Title } from "@ui5/webcomponents-react/Title";
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
import { CONTACT_CHECK_INTERVAL_DAYS, daysSince, formatDate } from "../../lib/register/workflow";
import type { CountryContact } from "../../lib/register/types";
import { useRegister } from "./store";

export function RegisterContacts() {
  const { contacts, updateContact } = useRegister();
  const [editing, setEditing] = useState<CountryContact | null>(null);

  const save = () => {
    if (!editing) return;
    updateContact({ ...editing, lastChecked: new Date().toISOString() });
    setEditing(null);
  };
  const set = (field: keyof CountryContact, value: string) =>
    setEditing((c) => c && { ...c, [field]: field === "countries" ? value.split(",").map((s) => s.trim()).filter(Boolean) : value });

  return <DynamicPage hidePinButton className="app-page"
    titleArea={<DynamicPageTitle heading={<Title level="H1" size="H3">Länder-Kontakte</Title>}
      subheading={<Text>Wer bei einer Sperre zusätzlich zum Account Executive informiert wird · Mock-Daten</Text>} />}>
    <div className="rg-page">
      <div className="rg-info-grid">
        <MessageStrip hideCloseButton design="Information">Manuelle Pflege: Die Personen wechseln mehrmals im Jahr. Eine HR-Anbindung ist wegen Personendaten schwierig.</MessageStrip>
        <MessageStrip hideCloseButton design="Critical">Prüfung alle {CONTACT_CHECK_INTERVAL_DAYS} Tage. Fällige Regionen erscheinen auf dem Dashboard. Intervall mit SAP bestätigen.</MessageStrip>
        <MessageStrip hideCloseButton design="Negative">Nie den Kunden selbst kontaktieren. Bei Sanktionen kann schon die Erklärung der Sperre verboten sein.</MessageStrip>
      </div>
      <Table accessibleName="Länder-Kontakte" overflowMode="Popin"
        headerRow={<TableHeaderRow sticky>
          <TableHeaderCell>Region</TableHeaderCell>
          <TableHeaderCell importance={1}>Länder</TableHeaderCell>
          <TableHeaderCell>General Director</TableHeaderCell>
          <TableHeaderCell>Legal Head</TableHeaderCell>
          <TableHeaderCell importance={1}>Commercial Director</TableHeaderCell>
          <TableHeaderCell importance={1}>Geprüft am</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell><span className="rg-sr-only">Aktion</span></TableHeaderCell>
        </TableHeaderRow>}>
        {contacts.map((c) => {
          const due = daysSince(c.lastChecked) > CONTACT_CHECK_INTERVAL_DAYS;
          return <TableRow key={c.id} rowKey={c.id}>
            <TableCell><Text className="rg-strong">{c.region}</Text></TableCell>
            <TableCell><Text>{c.countries.join(", ")}</Text></TableCell>
            <TableCell><Text>{c.generalDirector || "[offen]"}</Text></TableCell>
            <TableCell><Text>{c.legalHead || "[offen]"}</Text></TableCell>
            <TableCell><Text>{c.commercialDirector || "[offen]"}</Text></TableCell>
            <TableCell><Text>{formatDate(c.lastChecked)}</Text></TableCell>
            <TableCell><ObjectStatus inverted state={due ? "Critical" : "Positive"}>{due ? "Prüfung fällig" : "Aktuell"}</ObjectStatus></TableCell>
            <TableCell><Button icon="edit" design="Transparent" accessibleName={`${c.region} bearbeiten`} onClick={() => setEditing(c)}>Bearbeiten</Button></TableCell>
          </TableRow>;
        })}
      </Table>
      <Text className="rg-muted">Länder sind teils zu Regionen zusammengefasst, z. B. Iberia für Spanien und Portugal. Bei einer Sperre zieht das Register die Kontakte über das Land des Kunden.</Text>
    </div>

    <Dialog open={!!editing} headerText={editing ? `Region ${editing.region} bearbeiten` : ""} onClose={() => setEditing(null)}
      footer={<div className="rg-dialog-footer">
        <Button design="Emphasized" onClick={save}>Speichern und als geprüft markieren</Button>
        <Button design="Transparent" onClick={() => setEditing(null)}>Abbrechen</Button>
      </div>}>
      {editing && <div className="rg-dialog-form">
        <Field id="c-gd" label="General Director" value={editing.generalDirector} onInput={(v) => set("generalDirector", v)} />
        <Field id="c-lh" label="Legal Head" value={editing.legalHead} onInput={(v) => set("legalHead", v)} />
        <Field id="c-cd" label="Commercial Director" value={editing.commercialDirector} onInput={(v) => set("commercialDirector", v)} />
        <Field id="c-la" label="Länder der Region (kommagetrennt)" value={editing.countries.join(", ")} onInput={(v) => set("countries", v)} />
      </div>}
    </Dialog>
  </DynamicPage>;
}

function Field({ id, label, value, onInput }: { id: string; label: string; value: string; onInput: (v: string) => void }) {
  return <div className="rg-field"><Label for={id}>{label}</Label><Input id={id} value={value} onInput={(e) => onInput(e.target.value)} /></div>;
}
