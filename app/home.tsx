"use client";
import { DynamicPage } from "@ui5/webcomponents-react/DynamicPage";
import { DynamicPageTitle } from "@ui5/webcomponents-react/DynamicPageTitle";
import { Title } from "@ui5/webcomponents-react/Title";
import { Text } from "@ui5/webcomponents-react/Text";
import { Card } from "@ui5/webcomponents-react/Card";
import { CardHeader } from "@ui5/webcomponents-react/CardHeader";
import { List } from "@ui5/webcomponents-react/List";
import { ListItemStandard } from "@ui5/webcomponents-react/ListItemStandard";
import { Icon } from "@ui5/webcomponents-react/Icon";
import { ProgressIndicator } from "@ui5/webcomponents-react/ProgressIndicator";
import "@ui5/webcomponents-icons/dist/task.js";
import "@ui5/webcomponents-icons/dist/activity-items.js";
import type { Todo } from "./todos";

export function Home({ name, todos, onOpenTodos }: { name: string; todos: Todo[]; onOpenTodos: () => void }) {
  const done = todos.filter((t) => t.done).length;
  const open = todos.filter((t) => !t.done);
  const progress = todos.length ? Math.round((done / todos.length) * 100) : 0;

  return <DynamicPage hidePinButton className="app-page"
    titleArea={<DynamicPageTitle heading={<Title level="H1" size="H3">Willkommen, {name}</Title>}
      subheading={<Text>Dein Überblick über den Arbeitsbereich</Text>} />}>
    <div className="home-grid">
      <Card header={<CardHeader titleText="Aufgaben" subtitleText="Fortschritt" interactive avatar={<Icon name="task" />}
        additionalText={`${open.length} offen`} onClick={onOpenTodos} />}>
        <div className="home-card-body">
          <div className="home-kpi">{done}<span> / {todos.length}</span></div>
          <Text>erledigt</Text>
          <ProgressIndicator value={progress} accessibleName="Fortschritt Aufgaben" />
        </div>
      </Card>
      <Card header={<CardHeader titleText="Nächste Aufgaben" subtitleText="Offen" avatar={<Icon name="activity-items" />}
        interactive onClick={onOpenTodos} />}>
        {open.length === 0
          ? <div className="home-card-body"><Text>Keine offenen Aufgaben.</Text></div>
          : <List separators="Inner">
            {open.slice(0, 4).map((t) => <ListItemStandard key={t.id} icon="task" type="Inactive" text={t.text} />)}
          </List>}
      </Card>
    </div>
  </DynamicPage>;
}
