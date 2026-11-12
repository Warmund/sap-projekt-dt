"use client";
import type { ReactNode } from "react";
import { ObjectStatus } from "@ui5/webcomponents-react/ObjectStatus";
import { Title } from "@ui5/webcomponents-react/Title";
import { Text } from "@ui5/webcomponents-react/Text";
import type { OverallStatus, StepStatus } from "../../lib/register/types";

type State = "None" | "Positive" | "Critical" | "Negative" | "Information" | "Indication07";

const OVERALL: Record<OverallStatus, State> = {
  "Zur Freigabe": "Indication07",
  "Sperrschritte laufen": "Information",
  "Abgeschlossen": "Positive",
  "Sanktioniert ohne Sperre": "Critical",
  "Abgelehnt": "None",
};

export function StatusBadge({ status }: { status: OverallStatus }) {
  return <ObjectStatus inverted state={OVERALL[status]}>{status}</ObjectStatus>;
}

const STEP: Record<StepStatus, [string, State]> = {
  done: ["Erledigt", "Positive"],
  running: ["Läuft", "Information"],
  waiting: ["Wartet", "None"],
  pendingApproval: ["Wartet auf Freigabe", "Indication07"],
  skipped: ["Entfällt", "None"],
  notApplicable: ["Nicht relevant", "None"],
};

export function StepBadge({ status, label }: { status: StepStatus; label?: string }) {
  const [text, state] = STEP[status];
  // Mit label: kompakte Pille (nur Schrittname), Status über Farbe, Icon und Tooltip.
  return label
    ? <ObjectStatus inverted state={state} showDefaultIcon={status === "done" || status === "running"} title={`${label}: ${text}`}>{label}</ObjectStatus>
    : <ObjectStatus inverted={status !== "notApplicable"} state={state}>{text}</ObjectStatus>;
}

/** Kennzahl-Kachel. Mit onClick wird sie zur Navigations-Kachel. */
export function KpiTile({ title, value, sub, tone = "default", onClick }: {
  title: string; value: number | string; sub: string; tone?: "default" | "approval" | "warning" | "info"; onClick?: () => void;
}) {
  const content = <>
    <span className="rg-kpi-title">{title}</span>
    <span className={`rg-kpi-value rg-tone-${tone}`}>{value}</span>
    <span className="rg-kpi-sub">{sub}</span>
  </>;
  return onClick
    ? <button type="button" className={`rg-kpi rg-kpi-click rg-kpi-${tone}`} onClick={onClick}>{content}</button>
    : <div className={`rg-kpi rg-kpi-${tone}`}>{content}</div>;
}

export function Section({ title, sub, actions, children }: { title: string; sub?: string; actions?: ReactNode; children: ReactNode }) {
  return <section className="rg-section">
    <div className="rg-section-head">
      <div>
        <Title level="H2" size="H5">{title}</Title>
        {sub && <Text className="rg-muted">{sub}</Text>}
      </div>
      {actions && <div className="rg-actions">{actions}</div>}
    </div>
    {children}
  </section>;
}

/** Einfache horizontale Balken, ohne Chart-Bibliothek. */
export function BarList({ rows, label }: { rows: { label: string; value: number; hint?: string }[]; label: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return <ul className="rg-bars" aria-label={label}>
    {rows.map((r) => <li key={r.label}>
      <span className="rg-bar-label">{r.label}{r.hint && <small>{r.hint}</small>}</span>
      <span className="rg-bar-track" aria-hidden="true"><span className="rg-bar-fill" style={{ width: `${(r.value / max) * 100}%` }} /></span>
      <span className="rg-bar-value">{r.value}</span>
    </li>)}
  </ul>;
}

export function countBy<T>(items: T[], key: (t: T) => string) {
  const m = new Map<string, number>();
  items.forEach((i) => m.set(key(i), (m.get(key(i)) ?? 0) + 1));
  return [...m.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}
