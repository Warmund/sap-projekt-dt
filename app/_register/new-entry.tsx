"use client";

import { useState, type FormEvent } from "react";
import { DynamicPage } from "@ui5/webcomponents-react/DynamicPage";
import { DynamicPageTitle } from "@ui5/webcomponents-react/DynamicPageTitle";
import { Title } from "@ui5/webcomponents-react/Title";
import { Text } from "@ui5/webcomponents-react/Text";
import { Button } from "@ui5/webcomponents-react/Button";
import { Input } from "@ui5/webcomponents-react/Input";
import { Label } from "@ui5/webcomponents-react/Label";
import { Link } from "@ui5/webcomponents-react/Link";
import { MessageStrip } from "@ui5/webcomponents-react/MessageStrip";
import { Table } from "@ui5/webcomponents-react/Table";
import { TableHeaderRow } from "@ui5/webcomponents-react/TableHeaderRow";
import { TableHeaderCell } from "@ui5/webcomponents-react/TableHeaderCell";
import { TableRow } from "@ui5/webcomponents-react/TableRow";
import { TableCell } from "@ui5/webcomponents-react/TableCell";
import { GTS_DEMO_IDS, type GtsPartner } from "../../lib/register/gts";
import { useLanguage } from "../language";
import { loadGtsDraft } from "./actions";
import { useRegister } from "./store";
import { TagPicker } from "./tag-picker";
import { Section } from "./ui";

export function RegisterNewEntry() {
  const { t } = useLanguage();
  const { addPartnerFromGts, open, tags } = useRegister();
  const [lists, setLists] = useState<string[]>([]);
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [bpId, setBpId] = useState("");
  const [draft, setDraft] = useState<GtsPartner | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function changeId(value: string) {
    setBpId(value);
    setDraft(null);
    setTagIds([]);
    setError("");
  }

  async function lookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = bpId.trim();
    if (!id || loading || saving) return;
    setDraft(null);
    setError("");
    setLoading(true);
    try {
      const result = await loadGtsDraft(id);
      if (result.data) {
        setDraft(result.data);
        setLists(result.data.sanctionsLists ?? [result.data.sanctionsList]);
        setTagIds(result.data.specialCategory === "SR" ? tags.filter((tag) => tag.name === "SuccessRoom").map((tag) => tag.id) : []);
      }
      else setError(result.error);
    } catch {
      setError("GTS-Daten konnten nicht geladen werden. Bitte versuche es erneut.");
    } finally {
      setLoading(false);
    }
  }

  async function create() {
    if (!draft || saving) return;
    setSaving(true);
    try {
      const id = await addPartnerFromGts(draft.bpId, tagIds, lists.map((list) => list.trim()).filter(Boolean));
      if (id) open("rg-detail", id);
    } finally {
      setSaving(false);
    }
  }

  return <DynamicPage hidePinButton className="app-page"
    titleArea={<DynamicPageTitle breadcrumbs={<Link accessibleRole="Button" onClick={() => open("rg-register")}>{t("Register")}</Link>}
      heading={<Title level="H1" size="H3">{t("Neuer Datensatz aus GTS")}</Title>}
      subheading={<Text>{t("Suche den Geschäftspartner anhand seiner ID und prüfe die Daten vor dem Anlegen.")}</Text>} />}>
    <div className="rg-page rg-narrow rg-gts-page">
      <Section title={t("Geschäftspartner suchen")}>
        <form onSubmit={lookup} className="rg-gts-lookup" aria-busy={loading}>
          <div className="rg-field">
            <Label for="f-bp" required>{t("Business-Partner-ID")}</Label>
            <Input id="f-bp" value={bpId} required maxlength={100} disabled={loading || saving}
              accessibleName={t("Business-Partner-ID")} valueState={error ? "Negative" : "None"}
              onInput={(event) => changeId(event.target.value)} />
          </div>
          <Button type="Submit" design={draft ? "Default" : "Emphasized"} disabled={!bpId.trim() || loading || saving}>
            {t(loading ? "GTS-Daten werden geladen …" : "GTS-Daten laden")}
          </Button>
        </form>
        <div className="rg-actions">
          <Text className="rg-muted">{t("Simulierter Abruf · Beispiel-IDs")}</Text>
          {GTS_DEMO_IDS.map((id) => <Button key={id} design="Transparent" disabled={loading || saving}
            onClick={() => changeId(id)}>{id}</Button>)}
        </div>
        {error && <MessageStrip hideCloseButton design="Negative">{t(error)}</MessageStrip>}
      </Section>

      {draft && <>
        <GtsPreview partner={draft} lists={lists} onListsChange={setLists} saving={saving} />
        <Section title="Tags">
          <TagPicker ids={tagIds} onChange={setTagIds} disabled={saving} />
        </Section>
      </>}

      <div className="rg-gts-footer">
        {draft && <Text className="rg-muted">{t("Nach dem Anlegen geht der Fall zur Vier-Augen-Freigabe.")}</Text>}
        <div className="rg-actions rg-actions-end">
          <Button design="Transparent" disabled={saving} onClick={() => open("rg-register")}>{t("Abbrechen")}</Button>
          {draft && <Button design="Emphasized" disabled={saving || loading || !lists.some((list) => list.trim())} onClick={create}>
            {t("Datensatz anlegen, zur Freigabe")}
          </Button>}
        </div>
      </div>
    </div>
  </DynamicPage>;
}

function GtsPreview({ partner, lists, onListsChange, saving }: {
  partner: GtsPartner;
  lists: string[];
  onListsChange: (lists: string[]) => void;
  saving: boolean;
}) {
  const { t, date, dateTime } = useLanguage();
  const { currentUser } = useRegister();
  const missing = t("Nicht angegeben");
  const yesNo = (value: boolean | null | undefined) => value == null ? missing : t(value ? "Ja" : "Nein");

  return <>
    <div className="rg-gts-heading">
      <Title level="H2" size="H4">{t("Vorschau der GTS-Daten")}</Title>
      <Text className="rg-muted">{t("Sanktionslisten können vor dem Speichern angepasst werden.")}</Text>
    </div>

    <div className="rg-gts-columns">
      <Section title={t("Geschäftspartner")}>
        <Facts fields={[
          [t("Name"), partner.name],
          [t("Business-Partner-ID"), partner.bpId],
          [t("ERP-ID"), partner.erpId],
          [t("Land"), t(partner.country)],
          [t("Region"), partner.region || missing],
          [t("Gesperrt in GTS am"), partner.gtsDateOnly ? date(partner.gtsBlockedAt) : dateTime(partner.gtsBlockedAt)],
          [t("Erfasst von"), currentUser],
        ]} />
      </Section>
      <Section title={t("Sanktionsdaten")}>
        <Facts fields={[
          [t("ETS-Kategorie"), partner.ets],
          [t("Referenz auf Listeneintrag"), (lists.map((list) => list.trim()).find(Boolean) === partner.sanctionsList && partner.listReference) || missing],
          ["SPL", yesNo(partner.spl)],
          ["RU IT Consultancy Ban", yesNo(partner.ruItConsultancyBan)],
          [t("Ukraine Crisis"), yesNo(partner.ukraineCrisis)],
          [t("Kommentar"), partner.comment || missing],
        ]} />
        <Label>{t("Sanktionslisten")}</Label>
        {lists.map((list, index) => <div className="rg-actions" key={index}>
          <Input value={list} maxlength={300} disabled={saving} accessibleName={t("Sanktionsliste {0}", index + 1)}
            onInput={(event) => onListsChange(lists.map((value, i) => i === index ? event.target.value : value))} />
          <Button design="Transparent" disabled={saving} accessibleName={t("Sanktionsliste {0} entfernen", index + 1)}
            onClick={() => onListsChange(lists.filter((_, i) => i !== index))}>{t("Entfernen")}</Button>
        </div>)}
        {!lists.some((list) => list.trim()) && <Text className="rg-muted">{t("Gib mindestens eine Sanktionsliste an.")}</Text>}
        <div><Button design="Transparent" disabled={saving || lists.length >= 100}
          onClick={() => onListsChange([...lists, ""])}>{t("Sanktionsliste hinzufügen")}</Button></div>
      </Section>
    </div>

    <Section title={t("Cloud-Nutzung")}>
      <Facts fields={[[t("Cloud-Kunde"), yesNo(partner.cloudCustomer)]]} />
      {partner.tenants.length > 0 && <Table accessibleName={t("Gefundene Tenants")} overflowMode="Popin"
        headerRow={<TableHeaderRow>
          <TableHeaderCell>Line of Business</TableHeaderCell>
          <TableHeaderCell importance={1}>{t("Produkt")}</TableHeaderCell>
          <TableHeaderCell>{t("Tenant-ID")}</TableHeaderCell>
        </TableHeaderRow>}>
        {partner.tenants.map((tenant) => <TableRow key={tenant.tenantId} rowKey={tenant.tenantId}>
          <TableCell><Text>{tenant.lob}</Text></TableCell>
          <TableCell><Text>{tenant.product}</Text></TableCell>
          <TableCell><Text>{tenant.tenantId}</Text></TableCell>
        </TableRow>)}
      </Table>}
    </Section>
  </>;
}

function Facts({ fields }: { fields: [string, string][] }) {
  return <dl className="rg-facts">
    {fields.map(([label, value]) => <div className="rg-gts-fact" key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
  </dl>;
}
