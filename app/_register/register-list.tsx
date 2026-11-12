"use client";
import { useState } from "react";
import { DynamicPage } from "@ui5/webcomponents-react/DynamicPage";
import { DynamicPageTitle } from "@ui5/webcomponents-react/DynamicPageTitle";
import { Title } from "@ui5/webcomponents-react/Title";
import { Text } from "@ui5/webcomponents-react/Text";
import { Button } from "@ui5/webcomponents-react/Button";
import { Input } from "@ui5/webcomponents-react/Input";
import { Label } from "@ui5/webcomponents-react/Label";
import { Icon } from "@ui5/webcomponents-react/Icon";
import { Select } from "@ui5/webcomponents-react/Select";
import { Option } from "@ui5/webcomponents-react/Option";
import { SegmentedButton } from "@ui5/webcomponents-react/SegmentedButton";
import { SegmentedButtonItem } from "@ui5/webcomponents-react/SegmentedButtonItem";
import { MessageStrip } from "@ui5/webcomponents-react/MessageStrip";
import { Table } from "@ui5/webcomponents-react/Table";
import { TableHeaderRow } from "@ui5/webcomponents-react/TableHeaderRow";
import { TableHeaderCell } from "@ui5/webcomponents-react/TableHeaderCell";
import { TableRow } from "@ui5/webcomponents-react/TableRow";
import { TableCell } from "@ui5/webcomponents-react/TableCell";
import "@ui5/webcomponents-icons/dist/download.js";
import "@ui5/webcomponents-icons/dist/add-document.js";
import "@ui5/webcomponents-icons/dist/search.js";
import { formatDate, overallStatus, stepStatuses, STEP_DEFS } from "../../lib/register/workflow";
import type { BlockedPartner, StepKey } from "../../lib/register/types";
import { useRegister } from "./store";
import { StatusBadge, StepBadge } from "./ui";

type Part = "workflow" | "noBlock";
const SHORT: Record<StepKey, string> = { suser: "S-User", tickets: "Tickets", remote: "Remote", cloud: "Cloud", notify: "Info" };

export function RegisterList() {
  const { partners, variant, open } = useRegister();
  const [part, setPart] = useState<Part>("workflow");
  const [query, setQuery] = useState("");
  const [ets, setEts] = useState("Alle");
  const [cloud, setCloud] = useState("Alle");
  const [status, setStatus] = useState("Alle");

  const inPart = partners.filter((p) => part === "workflow"
    ? p.decision === "pending" || p.decision === "approved"
    : p.decision === "sanctionedNoBlock");
  const q = query.trim().toLowerCase();
  const rows = inPart.filter((p) =>
    (!q || [p.name, p.bpId, p.erpId, ...p.tenants.map((t) => t.tenantId)].some((v) => v.toLowerCase().includes(q))) &&
    (ets === "Alle" || p.ets === ets) &&
    (cloud === "Alle" || (cloud === "Ja") === p.cloudCustomer) &&
    (status === "Alle" || overallStatus(p, variant) === status));

  const exportCsv = () => downloadCsv(rows, variant);

  return <DynamicPage hidePinButton className="app-page"
    titleArea={<DynamicPageTitle heading={<Title level="H1" size="H3">Register sanktionierter Geschäftspartner</Title>}
      subheading={<Text>Teil 1: Sperr-Workflow · Teil 2: sanktioniert ohne Sperre · ersetzt die Excel-Liste „to be reported“</Text>}
      actionsBar={<div className="rg-actions">
        <Button icon="download" onClick={exportCsv}>Gefilterte Liste exportieren</Button>
        <Button design="Emphasized" icon="add-document" onClick={() => open("rg-new")}>Neuer Datensatz</Button>
      </div>} />}>
    <div className="rg-page">
      <SegmentedButton accessibleName="Teil des Registers" onSelectionChange={(e) => setPart(e.detail.selectedItems[0]?.dataset.key as Part)}>
        <SegmentedButtonItem data-key="workflow" selected={part === "workflow"}>Sperr-Workflow ({partners.filter((p) => p.decision === "pending" || p.decision === "approved").length})</SegmentedButtonItem>
        <SegmentedButtonItem data-key="noBlock" selected={part === "noBlock"}>Sanktioniert ohne Sperre ({partners.filter((p) => p.decision === "sanctionedNoBlock").length})</SegmentedButtonItem>
      </SegmentedButton>

      <div className="rg-filters">
        <div className="rg-field rg-field-wide">
          <Label for="rg-search">Suche nach Name oder ID</Label>
          <Input id="rg-search" icon={<Icon name="search" />} value={query} placeholder="Name, BP-ID, ERP-ID oder Tenant-ID" accessibleName="Suche"
            onInput={(e) => setQuery(e.target.value)} />
        </div>
        <div className="rg-field">
          <Label for="rg-ets">ETS-Kategorie</Label>
          <Select id="rg-ets" value={ets} onChange={(e) => setEts(e.target.value)}>
            {["Alle", "ETS1", "ETR1", "ETS2", "ETS3", "ETS4", "ETS5", "ETS6"].map((v) => <Option key={v} value={v}>{v}</Option>)}
          </Select>
        </div>
        <div className="rg-field">
          <Label for="rg-cloud">Cloud-Kunde</Label>
          <Select id="rg-cloud" value={cloud} onChange={(e) => setCloud(e.target.value)}>
            {["Alle", "Ja", "Nein"].map((v) => <Option key={v} value={v}>{v}</Option>)}
          </Select>
        </div>
        {part === "workflow" && <div className="rg-field">
          <Label for="rg-status">Status</Label>
          <Select id="rg-status" value={status} onChange={(e) => setStatus(e.target.value)}>
            {["Alle", "Zur Freigabe", "Sperrschritte laufen", "Abgeschlossen"].map((v) => <Option key={v} value={v}>{v}</Option>)}
          </Select>
        </div>}
      </div>

      {part === "workflow" && <Text className="rg-muted">Sperrschritte: grün erledigt, blau läuft, grau wartet. Details per Tooltip oder in der Detailansicht.</Text>}
      {part === "noBlock" && <MessageStrip hideCloseButton design="Information">
        Kunden, bei denen die Vier-Augen-Prüfung ergeben hat: sanktioniert, aber keine Sperrschritte nötig. Abgelehnte Datensätze stehen nur im Audit-Trail (Umgang mit SAP final klären).
      </MessageStrip>}

      <div className="rg-table-wrap">
        <Table accessibleName="Register" overflowMode="Popin" noDataText="Keine Einträge für diese Filter."
          onRowClick={(e) => open("rg-detail", e.detail.row.rowKey)}
          headerRow={<TableHeaderRow sticky>
            <TableHeaderCell minWidth="14rem">Geschäftspartner</TableHeaderCell>
            <TableHeaderCell importance={2}>Land</TableHeaderCell>
            <TableHeaderCell importance={2}>ETS</TableHeaderCell>
            <TableHeaderCell importance={1}>Sanktionsliste</TableHeaderCell>
            <TableHeaderCell importance={1}>Cloud</TableHeaderCell>
            <TableHeaderCell importance={1}>GTS-Sperre</TableHeaderCell>
            <TableHeaderCell minWidth="16rem">{part === "workflow" ? "Sperrschritte" : "Begründung"}</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
          </TableHeaderRow>}>
          {rows.map((p) => {
            const st = stepStatuses(p, variant);
            return <TableRow key={p.id} rowKey={p.id} interactive>
              <TableCell><div className="rg-cell-stack"><Text className="rg-strong">{p.name}</Text><Text className="rg-muted">BP {p.bpId} · ERP {p.erpId}{p.specialCategory ? ` · ${p.specialCategory}` : ""}</Text></div></TableCell>
              <TableCell><Text>{p.country}</Text></TableCell>
              <TableCell><Text>{p.ets}</Text></TableCell>
              <TableCell><Text>{p.sanctionsList}</Text></TableCell>
              <TableCell><Text>{p.cloudCustomer ? `Ja (${p.tenants.length})` : "Nein"}</Text></TableCell>
              <TableCell><Text>{formatDate(p.gtsBlockedAt)}</Text></TableCell>
              <TableCell>{part === "workflow"
                ? p.decision === "pending"
                  ? <StepBadge status="pendingApproval" />
                  : <div className="rg-step-pills">{(Object.keys(SHORT) as StepKey[]).filter((k) => st[k] !== "notApplicable").map((k) =>
                    <StepBadge key={k} status={st[k]} label={SHORT[k]} />)}</div>
                : <Text>{p.decisionComment ?? ""}</Text>}</TableCell>
              <TableCell><StatusBadge status={overallStatus(p, variant)} /></TableCell>
            </TableRow>;
          })}
        </Table>
      </div>
    </div>
  </DynamicPage>;
}

function downloadCsv(rows: BlockedPartner[], variant: "A" | "B") {
  const header = ["Name", "BP-ID", "ERP-ID", "Land", "ETS", "Sanktionsliste", "Cloud-Kunde", "Sonderkategorie", "GTS-Sperre", "Status", ...Object.values(STEP_DEFS).map((s) => s.label)];
  const lines = rows.map((p) => {
    const st = stepStatuses(p, variant);
    return [p.name, p.bpId, p.erpId, p.country, p.ets, p.sanctionsList, p.cloudCustomer ? "Ja" : "Nein", p.specialCategory ?? "", formatDate(p.gtsBlockedAt), overallStatus(p, variant),
      ...(Object.keys(STEP_DEFS) as StepKey[]).map((k) => st[k])];
  });
  const csv = [header, ...lines].map((l) => l.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";")).join("\n");
  const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: "sanktionsregister.csv" });
  a.click();
  URL.revokeObjectURL(url);
}
