"use client";
import { useLanguage } from "../language";
import { useState } from "react";
import { DynamicPage } from "@ui5/webcomponents-react/DynamicPage";
import { DynamicPageTitle } from "@ui5/webcomponents-react/DynamicPageTitle";
import { Title } from "@ui5/webcomponents-react/Title";
import { Text } from "@ui5/webcomponents-react/Text";
import { Input } from "@ui5/webcomponents-react/Input";
import { Button } from "@ui5/webcomponents-react/Button";
import { DatePicker } from "@ui5/webcomponents-react/DatePicker";
import { Label } from "@ui5/webcomponents-react/Label";
import { Option } from "@ui5/webcomponents-react/Option";
import { Panel } from "@ui5/webcomponents-react/Panel";
import { Select } from "@ui5/webcomponents-react/Select";
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

const emptyFilters = { country: "", ets: "", list: "", cloud: "", status: "", from: "", to: "" };
const unique = (values: string[]) => [...new Set(values)].filter(Boolean).sort((a, b) => a.localeCompare(b, "de"));

export function RegisterList() {
  const { registerFilter } = useRegister();
  return <RegisterResults key={registerFilter} />;
}

function RegisterResults() {
  const { t, date, language } = useLanguage();
  const { partners, open, registerFilter, setRegisterFilter } = useRegister();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("date-desc");
  const [filters, setFilters] = useState(emptyFilters);
  const activeCount = [filters.country, filters.ets, filters.list, filters.cloud, filters.status, filters.from || filters.to].filter(Boolean).length;
  const invalidRange = Boolean(filters.from && filters.to && filters.from > filters.to);
  const q = query.trim().toLowerCase();
  const scoped = partners.filter((p) => matchesRegisterFilter(p, registerFilter));
  const rows = scoped.filter((p) => {
    if (filters.country && p.country !== filters.country) return false;
    if (filters.ets && p.ets !== filters.ets) return false;
    if (filters.list && p.sanctionsList !== filters.list) return false;
    if (filters.cloud && p.cloudCustomer !== (filters.cloud === "Ja")) return false;
    if (filters.status && overallStatus(p) !== filters.status) return false;
    if (filters.from || filters.to) {
      const date = formatDate(p.gtsBlockedAt).split(".").reverse().join("-");
      if (invalidRange || (filters.from && date < filters.from) || (filters.to && date > filters.to)) return false;
    }
    return !q || [p.name, p.bpId, p.erpId, ...p.tenants.map((t) => t.tenantId)].some((v) => v.toLowerCase().includes(q));
  });
  const collator = new Intl.Collator(language, { numeric: true, sensitivity: "base" });
  rows.sort((a, b) => {
    const [field, direction] = sort.split("-");
    const values = {
      name: [a.name, b.name],
      country: [t(a.country), t(b.country)],
      ets: [a.ets, b.ets],
      list: [t(a.sanctionsList), t(b.sanctionsList)],
      cloud: [t(a.cloudCustomer ? "Ja" : "Nein"), t(b.cloudCustomer ? "Ja" : "Nein")],
      date: [a.gtsBlockedAt, b.gtsBlockedAt],
      status: [t(overallStatus(a)), t(overallStatus(b))],
    };
    const [left, right] = values[field as keyof typeof values] ?? values.date;
    return (direction === "desc" ? -1 : 1) * collator.compare(left, right) || collator.compare(a.bpId, b.bpId);
  });
  const selectFilters = [
    { key: "country", label: t("Land"), options: unique(scoped.map((p) => p.country)) },
    { key: "ets", label: "ETS", options: unique(scoped.map((p) => p.ets)) },
    { key: "list", label: t("Sanktionsliste"), options: unique(scoped.map((p) => p.sanctionsList)) },
    { key: "cloud", label: "Cloud", options: ["Ja", "Nein"] },
    { key: "status", label: t("Status"), options: unique(scoped.map(overallStatus)) },
  ] as const;
  const title = registerFilter === "all" ? t("Geschäftspartner") : t(REGISTER_FILTERS[registerFilter]);

  return <DynamicPage hidePinButton className="app-page"
    titleArea={<DynamicPageTitle heading={<Title level="H1" size="H3">{t("Register sanktionierter Geschäftspartner")}</Title>} />}>
    <div className="rg-page">
      <section className="rg-table-wrap" aria-labelledby="register-results">
        <div className="rg-table-toolbar">
          <div className="rg-actions">
            <Title id="register-results" level="H2" size="H5">{title} ({rows.length})</Title>
            {registerFilter !== "all" && <Link accessibleRole="Button" onClick={() => setRegisterFilter("all")}>{t("Alle Kunden anzeigen")}</Link>}
          </div>
          <div className="rg-actions">
          <Label for="register-sort">{t("Sortieren nach")}</Label>
          <Select id="register-sort" accessibleName={t("Sortieren nach")} value={sort} onChange={(e) => setSort(e.target.value)}>
            <Option value="date-desc">{t("GTS-Sperre: neueste zuerst")}</Option>
            <Option value="date-asc">{t("GTS-Sperre: älteste zuerst")}</Option>
            {[
              ["name", t("Geschäftspartner")], ["country", t("Land")], ["ets", "ETS"],
              ["list", t("Sanktionsliste")], ["cloud", "Cloud"], ["status", t("Status")],
            ].flatMap(([key, label]) => [
              <Option key={key + "-asc"} value={key + "-asc"}>{label}{t(": aufsteigend")}</Option>,
              <Option key={key + "-desc"} value={key + "-desc"}>{label}{t(": absteigend")}</Option>,
            ])}
          </Select>
          </div>
          <Input type="Search" accessibleName={t("Suche")} placeholder={t("Name, BP-ID, ERP-ID oder Tenant-ID")}
            icon={<Icon name="search" />} showClearIcon value={query} onInput={(e) => setQuery(e.target.value)} />
        </div>
        <Panel collapsed headerText={activeCount ? t("Filter ({0})", activeCount) : t("Filter")}>
          <div className="rg-form-grid">
            {selectFilters.map(({ key, label, options }) => <div className="rg-field" key={key}>
              <Label for={`register-${key}`}>{label}</Label>
              <Select id={`register-${key}`} accessibleName={label} value={filters[key]}
                onChange={(e) => setFilters((current) => ({ ...current, [key]: e.target.value }))}>
                <Option value="">{t("Alle")}</Option>
                {options.map((value) => <Option key={value} value={value}>{t(value)}</Option>)}
              </Select>
            </div>)}
            {(["from", "to"] as const).map((key) => {
              const label = key === "from" ? t("GTS-Sperre von") : t("GTS-Sperre bis");
              return <div key={key} className="rg-field">
                <Label for={`register-${key}`}>{label}</Label>
                <DatePicker id={`register-${key}`} accessibleName={label} valueFormat="yyyy-MM-dd" displayFormat={language === "de" ? "dd.MM.yyyy" : "MMM d, yyyy"}
                  value={filters[key]} onChange={({ detail }) => {
                    if (detail.valid || !detail.value) setFilters((current) => ({ ...current, [key]: detail.value }));
                  }} />
              </div>;
            })}
          </div>
          {invalidRange && <p role="alert">{t("Das Enddatum muss am oder nach dem Startdatum liegen.")}</p>}
          {activeCount > 0 && <div className="rg-actions rg-filter-actions">
            <Button design="Transparent" onClick={() => setFilters(emptyFilters)}>{t("Filter zurücksetzen")}</Button>
          </div>}
        </Panel>
        <Table accessibleName={title} overflowMode="Popin"
          noDataText={activeCount ? t("Keine Treffer. Ändere oder entferne die Filter.") : q ? t("Keine Treffer. Ändere den Suchbegriff.") : t("Keine Geschäftspartner in dieser Ansicht.")}
          onRowClick={(e) => open("rg-detail", e.detail.row.rowKey)}
          headerRow={<TableHeaderRow sticky>
            <TableHeaderCell importance={6} minWidth="9rem">{t("Geschäftspartner")}</TableHeaderCell>
            <TableHeaderCell importance={2}>{t("Land")}</TableHeaderCell>
            <TableHeaderCell importance={1} minWidth="4.5rem">ETS</TableHeaderCell>
            <TableHeaderCell importance={1}>{t("Sanktionsliste")}</TableHeaderCell>
            <TableHeaderCell importance={1}>Cloud</TableHeaderCell>
            <TableHeaderCell importance={2}>{t("GTS-Sperre")}</TableHeaderCell>
            <TableHeaderCell importance={5} minWidth="8rem">{t("Status")}</TableHeaderCell>
          </TableHeaderRow>}>
          {rows.map((p) => <TableRow key={p.id} rowKey={p.id} interactive>
            <TableCell><div className="rg-cell-stack">
              <Text className="rg-strong">{p.name}</Text>
              <Text className="rg-muted">{t("BP")} {p.bpId} · ERP {p.erpId}{p.specialCategory ? ` · ${t(p.specialCategory === "SR" ? "SuccessRoom (SR)" : p.specialCategory)}` : ""}</Text>
            </div></TableCell>
            <TableCell><Text>{t(p.country)}</Text></TableCell>
            <TableCell><Text>{p.ets}</Text></TableCell>
            <TableCell><Text>{t(p.sanctionsList)}</Text></TableCell>
            <TableCell><Text>{p.cloudCustomer ? p.tenants.length ? t("Ja ({0})", p.tenants.length) : t("Ja (Tenants fehlen)") : t("Nein")}</Text></TableCell>
            <TableCell><Text>{date(p.gtsBlockedAt)}</Text></TableCell>
            <TableCell><StatusBadge status={overallStatus(p)} /></TableCell>
          </TableRow>)}
        </Table>
      </section>
    </div>
  </DynamicPage>;
}
