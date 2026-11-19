"use client";
import { useLanguage } from "./language";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@ui5/webcomponents-react/Button";
import { Form } from "@ui5/webcomponents-react/Form";
import { FormGroup } from "@ui5/webcomponents-react/FormGroup";
import { FormItem } from "@ui5/webcomponents-react/FormItem";
import { Input } from "@ui5/webcomponents-react/Input";
import { Label } from "@ui5/webcomponents-react/Label";
import { MessageStrip } from "@ui5/webcomponents-react/MessageStrip";
import { MessageBox } from "@ui5/webcomponents-react/MessageBox";
import { Option } from "@ui5/webcomponents-react/Option";
import { Select } from "@ui5/webcomponents-react/Select";
import { Table } from "@ui5/webcomponents-react/Table";
import { TableCell } from "@ui5/webcomponents-react/TableCell";
import { TableHeaderCell } from "@ui5/webcomponents-react/TableHeaderCell";
import { TableHeaderRow } from "@ui5/webcomponents-react/TableHeaderRow";
import { TableRow } from "@ui5/webcomponents-react/TableRow";
import { Text } from "@ui5/webcomponents-react/Text";
import { Title } from "@ui5/webcomponents-react/Title";
import { authClient } from "../lib/auth-client";
import "@ui5/webcomponents-icons/dist/delete.js";

type User = { id: string; name: string; email: string; username?: string | null; role?: string | null };

export function Users() {
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  async function loadUsers() {
    const all: User[] = [];
    for (;;) {
      const result = await authClient.admin.listUsers({ query: { limit: 100, offset: all.length } });
      if (result.error || !result.data) throw new Error("Nutzerliste nicht verfügbar");
      all.push(...result.data.users);
      if (!result.data.users.length || all.length >= result.data.total) break;
    }
    setUsers(all);
  }

  useEffect(() => {
    // Load the protected user list after the administration view mounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadUsers().catch(() => setError("Die Nutzer konnten nicht geladen werden."));
  }, []);

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const name = String(values.get("name"));
    const username = String(values.get("username"));
    const email = String(values.get("email"));
    const password = String(values.get("password"));
    if (username.length < 3 || password.length < 8) {
      setError("Benutzername muss mindestens 3 Zeichen und Passwort mindestens 8 Zeichen enthalten.");
      return;
    }
    setError(""); setSuccess(""); setPending(true);
    try {
      const result = await authClient.admin.createUser({
        name, email, password, role: values.get("role") === "admin" ? "admin" : "user",
        data: { username },
      });
      if (result.error) { setError("Nutzer konnte nicht angelegt werden. Prüfe die Angaben und ob Benutzername und E-Mail bereits vergeben sind."); return; }
      form.reset();
      setSuccess(t("Nutzer wurde angelegt."));
      await loadUsers();
    } catch { setError("Nutzerverwaltung ist derzeit nicht verfügbar."); }
    finally { setPending(false); }
  }

  async function updateRole(userId: string, role: string) {
    setError(""); setSuccess(""); setUpdatingUserId(userId);
    try {
      const result = await authClient.admin.updateUser({ userId, data: { role: role === "admin" ? "admin" : "user" } });
      if (result.error) { setError("Die Rolle konnte nicht geändert werden."); return; }
      setSuccess(t("Rolle wurde geändert."));
      await loadUsers();
    } catch { setError("Nutzerverwaltung ist derzeit nicht verfügbar."); }
    finally { setUpdatingUserId(null); }
  }

  async function deleteUser() {
    if (!deletingUser) return;
    const user = deletingUser;
    setDeletingUser(null);
    setError(""); setSuccess("");
    setUpdatingUserId(user.id);
    try {
      const result = await authClient.admin.removeUser({ userId: user.id });
      if (result.error) { setError("Der Nutzer konnte nicht gelöscht werden."); return; }
      setSuccess(t("Nutzer {0} wurde gelöscht.", user.name));
      await loadUsers();
    } catch { setError("Nutzerverwaltung ist derzeit nicht verfügbar."); }
    finally { setUpdatingUserId(null); }
  }

  return <>
    <div className="user-admin">
      {error && <MessageStrip design="Negative" onClose={() => setError("")}>{t(error)}</MessageStrip>}
      {success && <MessageStrip design="Positive" onClose={() => setSuccess("")}>{success}</MessageStrip>}
      <section className="user-admin-section" aria-labelledby="user-list-title">
        <div className="user-admin-section-heading">
          <div>
            <Title id="user-list-title" level="H2" size="H4">{t("Nutzerliste")}</Title>
            <Text>{t("Rollen und Zugriffsrechte direkt in der Liste verwalten.")}</Text>
          </div>
        </div>
        <Table accessibleName={t("Nutzerliste")} alternateRowColors overflowMode="Popin" noDataText={t("Noch keine Nutzer vorhanden.")}
          headerRow={<TableHeaderRow sticky>
            <TableHeaderCell width="20%">{t("Name")}</TableHeaderCell>
            <TableHeaderCell width="20%" importance={2}>{t("Benutzername")}</TableHeaderCell>
            <TableHeaderCell width="35%" importance={1}>{t("E-Mail")}</TableHeaderCell>
            <TableHeaderCell width="25%">{t("Rolle und Aktionen")}</TableHeaderCell>
          </TableHeaderRow>}>
          {users.map((user) => <TableRow key={user.id} rowKey={user.id}>
            <TableCell><Text>{user.name}</Text></TableCell>
            <TableCell><Text>{user.username || "—"}</Text></TableCell>
            <TableCell><Text>{user.email}</Text></TableCell>
            <TableCell>
              <div className="user-row-actions">
                <Select value={user.role === "admin" ? "admin" : "user"} disabled={updatingUserId === user.id}
                  accessibleName={t("Rolle von {0}", user.name)} onChange={(event) => void updateRole(user.id, event.target.value)}>
                  <Option value="user">{t("Nutzer")}</Option>
                  <Option value="admin">Admin</Option>
                </Select>
                <Button design="Negative" icon="delete" tooltip={t("{0} löschen", user.name)}
                  accessibleName={t("{0} löschen", user.name)} disabled={updatingUserId === user.id}
                  onClick={() => setDeletingUser(user)}>{t("Löschen")}</Button>
              </div>
            </TableCell>
          </TableRow>)}
        </Table>
      </section>
      <section className="user-admin-section" aria-labelledby="new-user-title">
        <div className="user-admin-section-heading">
          <div>
            <Title id="new-user-title" level="H2" size="H4">{t("Neuen Nutzer hinzufügen")}</Title>
            <Text>{t("Lege einen neuen Zugang für den Arbeitsbereich an.")}</Text>
          </div>
        </div>
        <form onSubmit={createUser}>
          <Form accessibleMode="Edit" layout="S1 M2 L2 XL2" className="user-form" accessibleName={t("Neuen Nutzer hinzufügen")}>
            <FormGroup headerText={t("Zugangsdaten")}>
              <FormItem labelContent={<Label required>{t("Name")}</Label>}><Input name="name" required /></FormItem>
              <FormItem labelContent={<Label required>{t("Benutzername")}</Label>}><Input name="username" required /></FormItem>
              <FormItem labelContent={<Label required>{t("E-Mail")}</Label>}><Input name="email" type="Email" required /></FormItem>
              <FormItem labelContent={<Label required>{t("Passwort")}</Label>}><Input name="password" type="Password" required /></FormItem>
              <FormItem labelContent={<Label>{t("Rolle")}</Label>}>
                <Select name="role" value="user"><Option value="user">{t("Nutzer")}</Option><Option value="admin">Admin</Option></Select>
              </FormItem>
            </FormGroup>
          </Form>
          <div className="user-form-actions">
            <Button type="Submit" design="Emphasized" disabled={pending}>{t("Nutzer hinzufügen")}</Button>
          </div>
        </form>
      </section>
    </div>
    <MessageBox open={!!deletingUser} type="Confirm" titleText={t("Nutzer löschen")}
      actions={[
        <Button key="cancel" onClick={() => setDeletingUser(null)}>{t("Abbrechen")}</Button>,
        <Button key="delete" design="Emphasized" onClick={() => void deleteUser()}>{t("Löschen")}</Button>,
      ]}
      onClose={() => setDeletingUser(null)}>
      {deletingUser ? t("Möchtest du {0} wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.", deletingUser.name) : ""}
    </MessageBox>
  </>;
}
