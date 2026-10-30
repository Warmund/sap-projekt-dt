"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ThemeProvider } from "@ui5/webcomponents-react/ThemeProvider";
import { ShellBar } from "@ui5/webcomponents-react/ShellBar";
import { Button } from "@ui5/webcomponents-react/Button";
import { DynamicPage } from "@ui5/webcomponents-react/DynamicPage";
import { DynamicPageTitle } from "@ui5/webcomponents-react/DynamicPageTitle";
import { DynamicPageHeader } from "@ui5/webcomponents-react/DynamicPageHeader";
import { Input, type InputDomRef } from "@ui5/webcomponents-react/Input";
import { CheckBox } from "@ui5/webcomponents-react/CheckBox";
import { Select } from "@ui5/webcomponents-react/Select";
import { Option } from "@ui5/webcomponents-react/Option";
import { SegmentedButton } from "@ui5/webcomponents-react/SegmentedButton";
import { SegmentedButtonItem } from "@ui5/webcomponents-react/SegmentedButtonItem";
import { MessageStrip } from "@ui5/webcomponents-react/MessageStrip";
import { Icon } from "@ui5/webcomponents-react/Icon";
import "@ui5/webcomponents-icons/dist/add.js";
import "@ui5/webcomponents-icons/dist/search.js";
import "@ui5/webcomponents-icons/dist/delete.js";
import "@ui5/webcomponents-icons/dist/task.js";
import "@ui5/webcomponents-icons/dist/accept.js";
import "@ui5/webcomponents-icons/dist/log.js";
import { authClient } from "../lib/auth-client";

type Task = { id: string; title: string; done: boolean; priority: "normal" | "high" };
const initialTasks: Task[] = [
  { id: "demo-1", title: "Processflow für den nächsten SAP-Termin vorbereiten", done: false, priority: "high" },
  { id: "demo-2", title: "Offene Fragen zu Rollen und Zuständigkeiten sammeln", done: false, priority: "high" },
  { id: "demo-3", title: "Mock-Daten für Geschäftspartner abstimmen", done: false, priority: "normal" },
  { id: "demo-4", title: "Feedback zur Startseite festhalten", done: false, priority: "normal" },
  { id: "demo-5", title: "Projektzugang einrichten", done: true, priority: "normal" },
];

export function Shell({ userId }: { userId: string }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("normal");
  const [signingOut, setSigningOut] = useState(false);
  const input = useRef<InputDomRef>(null);
  // shortcut: Todos bleiben in diesem Browser; gemeinsame Aufgaben später serverseitig speichern.
  const storageKey = `sap-project-todos:v1:${userId}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) {
        const data: unknown = JSON.parse(saved);
        if (!Array.isArray(data) || !data.every((task) => task && typeof task.id === "string" && typeof task.title === "string" && task.title.trim().length > 0 && task.title.length <= 160 && typeof task.done === "boolean" && ["normal", "high"].includes(task.priority))) {
          throw new Error("Invalid saved tasks");
        }
        setTasks(data);
      }
    } catch {
      setMessage("Gespeicherte Aufgaben konnten nicht geladen werden. Du kannst mit den Beispielaufgaben weiterarbeiten.");
    }
    setReady(true);
  }, [storageKey]);

  function save(next: Task[]) {
    setTasks(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); }
    catch { setMessage("Deine Änderungen sind nur bis zum Neuladen verfügbar. Der Browserspeicher ist nicht zugänglich."); }
  }

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready || !title.trim() || title.trim().length > 160) return;
    save([{ id: crypto.randomUUID(), title: title.trim(), done: false, priority: priority === "high" ? "high" : "normal" }, ...tasks]);
    setTitle("");
    input.current?.focus();
  }

  const completed = tasks.filter((task) => task.done).length;
  const open = tasks.length - completed;
  const urgent = tasks.filter((task) => !task.done && task.priority === "high").length;
  const percent = tasks.length ? Math.round(completed / tasks.length * 100) : 0;
  const visible = tasks.filter((task) => (filter === "all" || (filter === "done" ? task.done : !task.done)) && task.title.toLocaleLowerCase("de").includes(query.toLocaleLowerCase("de")));

  return <ThemeProvider>
    <div className="workspace">
      <header className="workspace-shell">
        <ShellBar primaryTitle="SAP-Project-DT" secondaryTitle="Export Control" logo={<img src="/sap-logo.svg" width="60" height="30" alt="SAP" />} />
        <Button design="Transparent" icon="log" disabled={signingOut} onClick={async () => {
          setSigningOut(true);
          try {
            const result = await authClient.signOut();
            if (result.error) throw new Error("Sign out failed");
            window.location.assign("/login");
          } catch { setMessage("Abmelden derzeit nicht möglich. Bitte versuche es erneut."); setSigningOut(false); }
        }}>Abmelden</Button>
      </header>
      <DynamicPage className="workspace-page" accessibilityAttributes={{ root: { role: "main", name: "Mein Arbeitsplatz" } }}
        titleArea={<DynamicPageTitle
          breadcrumbs={<div className="workspace-breadcrumb">Export Control <span aria-hidden="true">/</span> Übersicht</div>}
          heading={<h1 className="workspace-title">Mein Arbeitsplatz</h1>}
          subheading={<p className="workspace-subtitle">Alles im Blick. Schritt für Schritt voran.</p>}
          snappedSubheading={<span>{open} offene Aufgaben · {urgent} mit hoher Priorität</span>}
          actionsBar={<Button icon="add" onClick={() => input.current?.focus()}>Neue Aufgabe</Button>}
        />}
        headerArea={<DynamicPageHeader accessibleName="Aufgabenübersicht">
          <div className="workspace-summary" aria-live="polite">
            <div className="summary-intro"><span className="workspace-eyebrow">DEIN PROJEKTÜBERBLICK</span><p>Raum für das,<br /><strong>was als Nächstes zählt.</strong></p></div>
            <div className="summary-metric"><span>Offene Aufgaben</span><strong>{open.toString().padStart(2, "0")}</strong><small>Bereit für deinen nächsten Schritt</small></div>
            <div className="summary-metric metric-critical"><span>Hohe Priorität</span><strong>{urgent.toString().padStart(2, "0")}</strong><small>Zuerst im Blick behalten</small></div>
            <div className="summary-metric metric-positive"><span>Erledigt</span><strong>{completed.toString().padStart(2, "0")}</strong><small>Jeder Schritt bringt uns weiter</small></div>
          </div>
        </DynamicPageHeader>}>
        <div className="workspace-content">
          {message && <MessageStrip design="Critical" onClose={() => setMessage("")}>{message}</MessageStrip>}
          <div className="workspace-section-label"><span>PERSÖNLICHER BEREICH</span><span className="demo-tag">Demo-Arbeitsplatz</span></div>
          <div className="workspace-columns">
            <section className="tasks-card" aria-labelledby="tasks-heading" aria-busy={!ready}>
              <div className="tasks-heading"><div><h2 id="tasks-heading">Meine Aufgaben <span>({tasks.length})</span></h2><p>Aus guten Vorhaben werden nächste Schritte.</p></div><Icon name="task" className="tasks-heading-icon" /></div>
              <form className="task-form" onSubmit={addTask}>
                <div className="task-title-field"><label id="task-title-label">Neue Aufgabe</label><Input ref={input} accessibleNameRef="task-title-label" placeholder="Was möchtest du erledigen?" value={title} maxlength={160} onInput={(event) => setTitle(event.currentTarget?.value ?? "")} disabled={!ready} /></div>
                <div className="task-priority-field"><label id="task-priority-label">Priorität</label><Select accessibleNameRef="task-priority-label" value={priority} onChange={(event) => setPriority(event.currentTarget?.value ?? "")}><Option value="normal">Normal</Option><Option value="high">Hoch</Option></Select></div>
                <Button design="Emphasized" type="Submit" icon="add" disabled={!ready || !title.trim()}>Hinzufügen</Button>
              </form>
              <div className="task-toolbar">
                <SegmentedButton accessibleName="Aufgabenstatus" onSelectionChange={(event) => setFilter(event.detail.selectedItems[0]?.dataset.filter ?? "all")}>
                  <SegmentedButtonItem data-filter="all" selected={filter === "all"}>Alle</SegmentedButtonItem>
                  <SegmentedButtonItem data-filter="open" selected={filter === "open"}>Offen</SegmentedButtonItem>
                  <SegmentedButtonItem data-filter="done" selected={filter === "done"}>Erledigt</SegmentedButtonItem>
                </SegmentedButton>
                <Input className="task-search" accessibleName="Aufgaben suchen" placeholder="Aufgaben suchen" value={query} onInput={(event) => setQuery(event.currentTarget?.value ?? "")} icon={<Icon name="search" />} />
              </div>
              <ul className="task-list" aria-label="Aufgaben">
                {visible.map((task) => <li key={task.id} className={`task-row${task.done ? " task-done" : ""}`}>
                  <CheckBox accessibleName={`${task.title} als ${task.done ? "offen" : "erledigt"} markieren`} checked={task.done} disabled={!ready} onChange={() => save(tasks.map((item) => item.id === task.id ? { ...item, done: !item.done } : item))} />
                  <div className="task-description"><span className="task-name">{task.title}</span><span className="task-status">{task.done ? "Erledigt" : "Offen"}</span></div>
                  <span className={`priority-tag ${task.priority === "high" && !task.done ? "priority-high" : ""}`}>{task.priority === "high" ? "Hoch" : "Normal"}</span>
                  <Button design="Transparent" icon="delete" accessibleName={`Aufgabe löschen: ${task.title}`} tooltip="Aufgabe löschen" disabled={!ready} onClick={() => save(tasks.filter((item) => item.id !== task.id))} />
                </li>)}
              </ul>
              {visible.length === 0 && <div className="tasks-empty"><Icon name="accept" /><h3>{tasks.length === 0 ? "Platz für neue Vorhaben" : "Keine passenden Aufgaben"}</h3><p>{tasks.length === 0 ? "Lege deine erste Aufgabe an und starte durch." : "Passe deine Suche oder den Statusfilter an."}</p></div>}
              <div className="tasks-footer" role="status">{visible.length} von {tasks.length} Aufgaben <span>In diesem Browser gespeichert</span></div>
            </section>
            <aside className="workspace-aside" aria-label="Fortschritt und Hinweise">
              <section className="progress-card"><span className="workspace-eyebrow">SCHON GESCHAFFT</span><div className="progress-value">{percent}<span>%</span><Icon name="accept" /></div><h2>Ein Schritt weiter.</h2><p>{completed} von {tasks.length} Aufgaben sind erledigt. Behalte deinen Fortschritt im Blick.</p><progress aria-label="Erledigte Aufgaben" value={completed} max={tasks.length || 1} /><div className="progress-caption"><span>Dein Fortschritt</span><strong>{completed} / {tasks.length}</strong></div></section>
              <section className="workspace-note"><span className="note-icon"><Icon name="task" /></span><h2>Klarer Fokus.<br />Gemeinsam voran.</h2><p>Sammle deine nächsten Schritte für das Export-Control-Projekt an einem Ort.</p><div className="note-divider" /><span className="workspace-eyebrow">DEIN DEMO-ARBEITSPLATZ</span><p>Die Beispielaufgaben kannst du frei ändern. Deine Liste bleibt in diesem Browser für deinen Projektzugang erhalten.</p></section>
            </aside>
          </div>
          <footer className="workspace-footer"><span>SAP Export Control</span><span>Hochschulprojekt · Gemeinsam Ideen weiterdenken.</span></footer>
        </div>
      </DynamicPage>
    </div>
  </ThemeProvider>;
}
