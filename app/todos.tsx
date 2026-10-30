"use client";
import { useState } from "react";
import { DynamicPage } from "@ui5/webcomponents-react/DynamicPage";
import { DynamicPageTitle } from "@ui5/webcomponents-react/DynamicPageTitle";
import { Title } from "@ui5/webcomponents-react/Title";
import { Text } from "@ui5/webcomponents-react/Text";
import { Input } from "@ui5/webcomponents-react/Input";
import { Button } from "@ui5/webcomponents-react/Button";
import { CheckBox } from "@ui5/webcomponents-react/CheckBox";
import { List } from "@ui5/webcomponents-react/List";
import { ListItemCustom } from "@ui5/webcomponents-react/ListItemCustom";
import { SegmentedButton } from "@ui5/webcomponents-react/SegmentedButton";
import { SegmentedButtonItem } from "@ui5/webcomponents-react/SegmentedButtonItem";
import { IllustratedMessage } from "@ui5/webcomponents-react/IllustratedMessage";
import "@ui5/webcomponents-fiori/dist/illustrations/NoTasks.js";
import "@ui5/webcomponents-icons/dist/add.js";
import "@ui5/webcomponents-icons/dist/delete.js";

export type Todo = { id: string; text: string; done: boolean };
type Filter = "all" | "open" | "done";

export function Todos({ todos, onChange: save }: { todos: Todo[]; onChange: (next: Todo[]) => void }) {
  const [draft, setDraft] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const add = () => {
    const text = draft.trim();
    if (!text) return;
    save([{ id: crypto.randomUUID(), text, done: false }, ...todos]);
    setDraft("");
  };

  const openCount = todos.filter((t) => !t.done).length;
  const visible = todos.filter((t) => filter === "all" || (filter === "done") === t.done);

  return <DynamicPage hidePinButton className="app-page"
    titleArea={<DynamicPageTitle heading={<Title level="H1" size="H3">Aufgaben</Title>}
      subheading={<Text>{openCount} offen · {todos.length - openCount} erledigt</Text>} />}>
    <div className="todo-card">
      <form className="todo-add" onSubmit={(e) => { e.preventDefault(); add(); }}>
        <Input className="todo-input" value={draft} placeholder="Neue Aufgabe hinzufügen" accessibleName="Neue Aufgabe"
          onInput={(e) => setDraft(e.target.value)} />
        <Button design="Emphasized" icon="add" type="Submit" disabled={!draft.trim()}>Hinzufügen</Button>
      </form>
      <SegmentedButton accessibleName="Filter" onSelectionChange={(e) => setFilter(e.detail.selectedItems[0]?.dataset.key as Filter)}>
        <SegmentedButtonItem data-key="all" selected={filter === "all"}>Alle ({todos.length})</SegmentedButtonItem>
        <SegmentedButtonItem data-key="open" selected={filter === "open"}>Offen ({openCount})</SegmentedButtonItem>
        <SegmentedButtonItem data-key="done" selected={filter === "done"}>Erledigt ({todos.length - openCount})</SegmentedButtonItem>
      </SegmentedButton>
      {visible.length === 0
        ? <IllustratedMessage name="NoTasks" titleText="Keine Aufgaben" subtitleText="Lege oben eine neue Aufgabe an." />
        : <List separators="Inner">
          {visible.map((t) => <ListItemCustom key={t.id} accessibleName={t.text}>
            <div className="todo-row">
              <CheckBox checked={t.done} text={t.text} className={t.done ? "todo-done" : undefined}
                onChange={(e) => save(todos.map((x) => x.id === t.id ? { ...x, done: e.target.checked } : x))} />
              <Button design="Transparent" icon="delete" tooltip="Löschen" accessibleName={`${t.text} löschen`}
                onClick={() => save(todos.filter((x) => x.id !== t.id))} />
            </div>
          </ListItemCustom>)}
        </List>}
    </div>
  </DynamicPage>;
}
