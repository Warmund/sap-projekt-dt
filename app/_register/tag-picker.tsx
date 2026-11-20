"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@ui5/webcomponents-react/Button";
import { CheckBox } from "@ui5/webcomponents-react/CheckBox";
import { Input } from "@ui5/webcomponents-react/Input";
import { ResponsivePopover } from "@ui5/webcomponents-react/ResponsivePopover";
import { Text } from "@ui5/webcomponents-react/Text";
import "@ui5/webcomponents-icons/dist/add.js";
import { useLanguage } from "../language";
import { useRegister } from "./store";

export function TagPicker({ ids, onChange, disabled }: {
  ids: string[];
  onChange?: (ids: string[]) => void | Promise<unknown>;
  disabled?: boolean;
}) {
  const { t } = useLanguage();
  const { tags, createTag } = useRegister();
  const [opener, setOpener] = useState<HTMLElement | null>(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function update(next: string[]) {
    setBusy(true);
    try { await onChange?.(next); } finally { setBusy(false); }
  }

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || busy || disabled) return;
    setBusy(true);
    try {
      const tag = await createTag(name.trim());
      if (tag) {
        setName("");
        await onChange?.([...ids, tag.id]);
      }
    } finally { setBusy(false); }
  }

  return <div className="rg-actions">
    {tags.filter((tag) => ids.includes(tag.id)).map((tag) => <Text key={tag.id} className="rg-chip">{tag.name}</Text>)}
    {!ids.length && <Text className="rg-muted">{t("Keine Tags")}</Text>}
    {onChange && <>
      <Button icon="add" design="Transparent" tooltip={t("Tags bearbeiten")} accessibleName={t("Tags bearbeiten")}
        disabled={disabled || busy} onClick={(event) => setOpener(event.currentTarget)} />
      <ResponsivePopover open={!!opener} opener={opener} placement="Bottom" headerText={t("Tags bearbeiten")}
        onClose={() => { setOpener(null); setName(""); }}>
        <div className="rg-tag-menu">
          <div className="rg-tag-options">
            {tags.map((tag) => <CheckBox key={tag.id} text={tag.name} checked={ids.includes(tag.id)} disabled={busy || disabled}
              onChange={(event) => void update(event.target.checked ? [...ids, tag.id] : ids.filter((id) => id !== tag.id))} />)}
          </div>
          <form className="rg-actions" onSubmit={add}>
            <Input accessibleName={t("Neues Tag")} placeholder={t("Neues Tag")} maxlength={100} value={name}
              disabled={busy || disabled} onInput={(event) => setName(event.target.value)} />
            <Button type="Submit" disabled={!name.trim() || busy || disabled}>{t("Tag hinzufügen")}</Button>
          </form>
        </div>
      </ResponsivePopover>
    </>}
  </div>;
}
