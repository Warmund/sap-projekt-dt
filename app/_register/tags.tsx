"use client";

import { useState } from "react";
import { Button } from "@ui5/webcomponents-react/Button";
import { CheckBox } from "@ui5/webcomponents-react/CheckBox";
import { Input } from "@ui5/webcomponents-react/Input";
import { Label } from "@ui5/webcomponents-react/Label";
import { Option } from "@ui5/webcomponents-react/Option";
import { Select } from "@ui5/webcomponents-react/Select";
import { Text } from "@ui5/webcomponents-react/Text";
import { useLanguage } from "../language";
import { useRegister } from "./store";
import { Section } from "./ui";

export function RegisterTags({ canEdit }: { canEdit: boolean }) {
  const { t } = useLanguage();
  const { tags, partners, createTag, setTags } = useRegister();
  const [name, setName] = useState("");
  const [partnerId, setPartnerId] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  async function add() {
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      if (await createTag(name.trim())) setName("");
    } finally { setSaving(false); }
  }

  async function save() {
    if (!partnerId || saving) return;
    setSaving(true);
    try { await setTags(partnerId, selected); } finally { setSaving(false); }
  }

  return <div className="rg-page">
    <Section title={t("Verfügbare Tags")}>
      <div className="rg-actions">{tags.map((tag) => <Text key={tag.id} className="rg-chip">{tag.name}</Text>)}</div>
      {canEdit && <div className="rg-actions">
        <Label for="new-tag">{t("Neues Tag")}</Label>
        <Input id="new-tag" value={name} maxlength={100} onInput={(event) => setName(event.target.value)} />
        <Button disabled={!name.trim() || saving} onClick={add}>{t("Tag hinzufügen")}</Button>
      </div>}
    </Section>
    {canEdit && <Section title={t("Tags für Kunden verwalten")}>
      <Label for="tag-customer">{t("Geschäftspartner")}</Label>
      <Select id="tag-customer" value={partnerId} onChange={(event) => {
        const id = event.target.value;
        setPartnerId(id);
        setSelected(partners.find((partner) => partner.id === id)?.tags?.map((tag) => tag.id) ?? []);
      }}>
        <Option value="">{t("Kunden auswählen")}</Option>
        {partners.map((partner) => <Option key={partner.id} value={partner.id}>{partner.name} · {partner.bpId}</Option>)}
      </Select>
      {partnerId && <>
        <div className="rg-actions">{tags.map((tag) => <CheckBox key={tag.id} text={tag.name} checked={selected.includes(tag.id)}
          onChange={(event) => { const checked = event.target.checked; setSelected((current) => checked ? [...current, tag.id] : current.filter((id) => id !== tag.id)); }} />)}</div>
        <div className="rg-actions"><Button design="Emphasized" disabled={saving} onClick={save}>{t("Tags speichern")}</Button></div>
      </>}
    </Section>}
  </div>;
}
