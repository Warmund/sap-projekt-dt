"use client";
import { useLanguage } from "../language";
import { useState } from "react";
import { DynamicPage } from "@ui5/webcomponents-react/DynamicPage";
import { DynamicPageTitle } from "@ui5/webcomponents-react/DynamicPageTitle";
import { Title } from "@ui5/webcomponents-react/Title";
import { Text } from "@ui5/webcomponents-react/Text";
import { Button } from "@ui5/webcomponents-react/Button";
import { Input } from "@ui5/webcomponents-react/Input";
import { Label } from "@ui5/webcomponents-react/Label";
import { Select } from "@ui5/webcomponents-react/Select";
import { Option } from "@ui5/webcomponents-react/Option";
import { TextArea } from "@ui5/webcomponents-react/TextArea";
import { CheckBox } from "@ui5/webcomponents-react/CheckBox";
import { Link } from "@ui5/webcomponents-react/Link";
import { MessageStrip } from "@ui5/webcomponents-react/MessageStrip";
import { Table } from "@ui5/webcomponents-react/Table";
import { TableHeaderRow } from "@ui5/webcomponents-react/TableHeaderRow";
import { TableHeaderCell } from "@ui5/webcomponents-react/TableHeaderCell";
import { TableRow } from "@ui5/webcomponents-react/TableRow";
import { TableCell } from "@ui5/webcomponents-react/TableCell";
import { GTS_SAMPLE, SANCTIONS_LISTS } from "../../lib/register/mock-data";
import { STEP_ORDER, STEP_DEFS, SCG_STEPS } from "../../lib/register/workflow";
import type { BlockedPartner, Tenant } from "../../lib/register/types";
import { useRegister } from "./store";
import { Section } from "./ui";

export function RegisterNewEntry() {
  const { t } = useLanguage();
  const { addPartner, open, currentUser } = useRegister();
  const [filled, setFilled] = useState(false);
  const [tenants, setTenants] = useState<Tenant[] | null>(null);
  const [list, setList] = useState(GTS_SAMPLE.list);
  const [reference, setReference] = useState("");
  const [sr, setSr] = useState(false);
  const [other, setOther] = useState(false);
  const [specialComment, setSpecialComment] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const g = filled ? GTS_SAMPLE : null;

  const create = async () => {
    if (!g) { setError("Bitte zuerst die Daten aus GTS übernehmen (im Prototyp simuliert)."); return; }
    const now = new Date().toISOString();
    const partner: BlockedPartner = {
      id: `neu-${Date.now()}`, bpId: g.bpId, erpId: g.erpId, name: g.name, country: g.country, ets: g.ets,
      sanctionsList: list, listReference: reference || undefined, gtsBlockedAt: now, enteredBy: currentUser,
      decision: "pending", cloudCustomer: !!tenants?.length, tenants: tenants ?? [],
      specialCategory: sr ? "SR" : other ? "Sonstige" : null, specialComment: specialComment || undefined,
      comment: comment || "Keine Anmerkungen.", completed: {},
      audit: [
        { at: now, by: `${currentUser} (EC Member 1)`, text: "In SAP GTS gesperrt (simuliert)" },
        { at: now, by: t("System"), text: "Datensatz im Register angelegt" },
      ],
    };
    if (await addPartner(partner)) open("rg-detail");
  };

  return <DynamicPage hidePinButton className="app-page"
    titleArea={<DynamicPageTitle breadcrumbs={<Link accessibleRole="Button" onClick={() => open("rg-register")}>{t("Register")}</Link>}
      heading={<Title level="H1" size="H3">{t("Neuer Datensatz aus GTS")}</Title>}
      subheading={<Text>{t("Zielbild: entsteht automatisch, sobald EC Member 1 in SAP GTS sperrt. Im Prototyp von Hand.")}</Text>} />}>
    <div className="rg-page">
      <MessageStrip hideCloseButton design="Information">
        {t("Im Prototyp werden die GTS-Daten simuliert. Der Button füllt einen erfundenen Beispieldatensatz ein.")}{" "}
        <Button design="Transparent" onClick={() => { setFilled(true); setError(""); }}>{t("Aus GTS übernehmen (simuliert)")}</Button>
      </MessageStrip>
      {error && <MessageStrip design="Negative" onClose={() => setError("")}>{t(error)}</MessageStrip>}

      <div className="rg-detail-grid">
        <div className="rg-detail-main">
          <Section title={t("1 Geschäftspartner (aus GTS)")}>
            <div className="rg-form-grid">
              <ReadOnly id="f-bp" label={t("Business-Partner-ID")} value={g?.bpId} />
              <ReadOnly id="f-name" label={t("Name")} value={g?.name} />
              <ReadOnly id="f-erp" label={t("ERP-ID")} value={g?.erpId} />
              <ReadOnly id="f-land" label={t("Land")} value={g?.country} />
              <ReadOnly id="f-date" label={t("Gesperrt in GTS am")} value={g ? t("beim Anlegen") : undefined} />
              <ReadOnly id="f-ec1" label={t("Gesperrt von (EC Member 1)")} value={g ? currentUser : undefined} />
            </div>
          </Section>

          <Section title={t("2 Sanktion")} sub={t("Der Listentyp bestimmt die Kategorie, z. B. US-SDN-Liste ergibt ETS4. Kunden aus Russland kommen automatisch in ETS6.")}>
            <div className="rg-form-grid">
              <ReadOnly id="f-ets" label={t("ETS-Kategorie (aus GTS)")} value={g?.ets} />
              <div className="rg-field">
                <Label for="f-list" required>{t("Sanktionsliste")}</Label>
                <Select id="f-list" value={list} onChange={(e) => setList(e.target.value)}>
                  {SANCTIONS_LISTS.map((l) => <Option key={l} value={l}>{t(l)}</Option>)}
                </Select>
                <Text className="rg-muted">{t("Auswahlliste, pflegbar durch berechtigte Nutzer")}</Text>
              </div>
              <div className="rg-field">
                <Label for="f-ref">{t("Referenz auf Listeneintrag")}</Label>
                <Input id="f-ref" value={reference} placeholder={t("[Referenz aus der Sanktionsliste]")} onInput={(e) => setReference(e.target.value)} />
              </div>
            </div>
          </Section>

          <Section title={t("3 Cloud-Kunde")} sub={t("Ob der Kunde Cloud-Produkte nutzt, kommt im Zielbild aus einem SAP-System. Welches System, ist noch mit SAP zu klären.")}
            actions={<Button disabled={!g} onClick={() => setTenants(GTS_SAMPLE.tenants)}>{t("Cloud-Status prüfen (simuliert)")}</Button>}>
            {tenants && <>
              <Text className="rg-strong">{t("Cloud-Kunde: Ja ·")} {tenants.length} Tenants</Text>
              <Table accessibleName={t("Gefundene Tenants")} overflowMode="Popin"
                headerRow={<TableHeaderRow><TableHeaderCell>Line of Business</TableHeaderCell><TableHeaderCell>{t("Produkt")}</TableHeaderCell><TableHeaderCell>{t("Tenant-ID")}</TableHeaderCell></TableHeaderRow>}>
                {tenants.map((t) => <TableRow key={t.tenantId} rowKey={t.tenantId}>
                  <TableCell><Text>{t.lob}</Text></TableCell><TableCell><Text>{t.product}</Text></TableCell><TableCell><Text>{t.tenantId}</Text></TableCell>
                </TableRow>)}
              </Table>
            </>}
          </Section>

          <Section title={t("4 Sonderkategorie")} sub={t("SR-Kunden bekommen eine eigene Kachel im Dashboard. Bedeutung von SR mit SAP bestätigen.")}>
            <div className="rg-actions">
              <CheckBox text={t("SR-Kunde")} checked={sr} onChange={(e) => setSr(e.target.checked)} />
              <CheckBox text={t("Sonstige Sonderkategorie")} checked={other} onChange={(e) => setOther(e.target.checked)} />
            </div>
            <div className="rg-field">
              <Label for="f-special">{t("Kommentar zur Sonderkategorie")}</Label>
              <Input id="f-special" value={specialComment} onInput={(e) => setSpecialComment(e.target.value)} />
            </div>
          </Section>

          <Section title={t("5 Kommentar")}>
            <div className="rg-field">
              <Label for="f-comment">{t("Begründung, Verlauf, Besonderheiten")}</Label>
              <TextArea id="f-comment" rows={4} value={comment} onInput={(e) => setComment(e.target.value)} />
            </div>
          </Section>

          <div className="rg-actions rg-actions-end">
            <Button design="Transparent" onClick={() => open("rg-register")}>{t("Abbrechen")}</Button>
            <Button design="Emphasized" onClick={create}>{t("Datensatz anlegen, zur Freigabe")}</Button>
          </div>
        </div>

        <aside className="rg-detail-side">
          <Section title={t("Sperrschritte nach der Freigabe")}>
            <ol className="rg-mini-steps">
              {STEP_ORDER.map((key, i) => <li key={key}>
                <span className="rg-step-nr" aria-hidden="true">{i + 3}</span>
                <div><Text className="rg-strong">{t(STEP_DEFS[key].label)}</Text><br /><Text className="rg-muted">{key === "scg" ? SCG_STEPS.map((step) => t(STEP_DEFS[step].label)).join(" · ") : t(STEP_DEFS[key].system)}</Text></div>
              </li>)}
            </ol>
          </Section>
          <Section title={t("So geht es weiter")}>
            <ol className="rg-plain-list">
              <li>{t("Datensatz zählt auf der Dashboard-Kachel „Zur Freigabe“, keine E-Mail")}</li>
              <li>{t("EC Member 2 entscheidet: freigeben, sanktioniert ohne Sperre oder ablehnen")}</li>
              <li>{t("Bei Freigabe laufen die Sperrschritte, jeder meldet seinen Status ins Register")}</li>
              <li>{t("E-Mail unter „Benachrichtigungen“ vorbereiten")}</li>
            </ol>
          </Section>
        </aside>
      </div>
    </div>
  </DynamicPage>;
}

function ReadOnly({ id, label, value }: { id: string; label: string; value?: string }) {
  const { t } = useLanguage();
  return <div className="rg-field">
    <Label for={id}>{label}</Label>
    <Input id={id} readonly value={value ?? ""} placeholder={t("aus GTS")} />
  </div>;
}
