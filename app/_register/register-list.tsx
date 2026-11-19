"use client";
import { useState } from "react";
import { DynamicPage } from "@ui5/webcomponents-react/DynamicPage";
import { DynamicPageTitle } from "@ui5/webcomponents-react/DynamicPageTitle";
import { Title } from "@ui5/webcomponents-react/Title";
import { Text } from "@ui5/webcomponents-react/Text";
import { Input } from "@ui5/webcomponents-react/Input";
import { Icon } from "@ui5/webcomponents-react/Icon";
import { Link } from "@ui5/webcomponents-react/Link";
import { Table } from "@ui5/webcomponents-react/Table";
import { TableHeaderRow } from "@ui5/webcomponents-react/TableHeaderRow";
import { TableHeaderCell } from "@ui5/webcomponents-react/TableHeaderCell";
import { TableRow } from "@ui5/webcomponents-react/TableRow";
import { TableCell } from "@ui5/webcomponents-react/TableCell";
import "@ui5/webcomponents-icons/dist/search.js";
import { formatDate, overallStatus } from "../../lib/register/workflow";
import { matchesRegisterFilter, REGISTER_FILTERS } from "../../lib/register/dashboard";
import { useRegister } from "./store";
import { StatusBadge } from "./ui";

export function RegisterList() {
  const { registerFilter } = useRegister();
  return <RegisterResults key={registerFilter} />;
}

function RegisterResults() {
  const { partners, open, registerFilter, setRegisterFilter } = useRegister();
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const rows = partners.filter((p) =>
    matchesRegisterFilter(p, registerFilter) &&
    (!q || [p.name, p.bpId, p.erpId, ...p.tenants.map((t) => t.tenantId)].some((v) => v.toLowerCase().includes(q))),
  );
  const title = registerFilter === "all" ? "Geschäftspartner" : REGISTER_FILTERS[registerFilter];

  return <DynamicPage hidePinButton className="app-page"
    titleArea={<DynamicPageTitle heading={<Title level="H1" size="H3">Register sanktionierter Geschäftspartner</Title>} />}>
    <div className="rg-page">
      <section className="rg-table-wrap" aria-labelledby="register-results">
        <div className="rg-table-toolbar">
          <div className="rg-actions">
            <Title id="register-results" level="H2" size="H5">{title} ({rows.length})</Title>
            {registerFilter !== "all" && <Link accessibleRole="Button" onClick={() => setRegisterFilter("all")}>Alle Kunden anzeigen</Link>}
          </div>
          <Input type="Search" accessibleName="Suche" placeholder="Name, BP-ID, ERP-ID oder Tenant-ID"
            icon={<Icon name="search" />} showClearIcon value={query} onInput={(e) => setQuery(e.target.value)} />
        </div>
        <Table accessibleName={title} overflowMode="Popin"
          noDataText={q ? "Keine Treffer. Ändere den Suchbegriff." : "Keine Geschäftspartner in dieser Ansicht."}
          onRowClick={(e) => open("rg-detail", e.detail.row.rowKey)}
          headerRow={<TableHeaderRow sticky>
            <TableHeaderCell importance={6} minWidth="9rem">Geschäftspartner</TableHeaderCell>
            <TableHeaderCell importance={2}>Land</TableHeaderCell>
            <TableHeaderCell importance={1} minWidth="4.5rem">ETS</TableHeaderCell>
            <TableHeaderCell importance={1}>Sanktionsliste</TableHeaderCell>
            <TableHeaderCell importance={1}>Cloud</TableHeaderCell>
            <TableHeaderCell importance={2}>GTS-Sperre</TableHeaderCell>
            <TableHeaderCell importance={5} minWidth="8rem">Status</TableHeaderCell>
          </TableHeaderRow>}>
          {rows.map((p) => <TableRow key={p.id} rowKey={p.id} interactive>
            <TableCell><div className="rg-cell-stack">
              <Text className="rg-strong">{p.name}</Text>
              <Text className="rg-muted">BP {p.bpId} · ERP {p.erpId}{p.specialCategory ? ` · ${p.specialCategory}` : ""}</Text>
            </div></TableCell>
            <TableCell><Text>{p.country}</Text></TableCell>
            <TableCell><Text>{p.ets}</Text></TableCell>
            <TableCell><Text>{p.sanctionsList}</Text></TableCell>
            <TableCell><Text>{p.cloudCustomer ? p.tenants.length ? `Ja (${p.tenants.length})` : "Ja (Tenants fehlen)" : "Nein"}</Text></TableCell>
            <TableCell><Text>{formatDate(p.gtsBlockedAt)}</Text></TableCell>
            <TableCell><StatusBadge status={overallStatus(p)} /></TableCell>
          </TableRow>)}
        </Table>
      </section>
    </div>
  </DynamicPage>;
}
