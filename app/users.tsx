"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@ui5/webcomponents-react/Button";
import { authClient } from "../lib/auth-client";

type User = { id: string; name: string; email: string; username?: string | null; role?: string | null };

export function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);

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
    setError(""); setSuccess(""); setPending(true);
    try {
      const result = await authClient.admin.createUser({
        name: String(values.get("name")), email: String(values.get("email")),
        password: String(values.get("password")), role: values.get("role") === "admin" ? "admin" : "user",
        data: { username: String(values.get("username")) },
      });
      if (result.error) { setError("Nutzer konnte nicht angelegt werden. Prüfe die Angaben und ob Benutzername und E-Mail bereits vergeben sind."); return; }
      form.reset();
      setSuccess("Nutzer wurde angelegt.");
      await loadUsers();
    } catch { setError("Nutzerverwaltung ist derzeit nicht verfügbar."); }
    finally { setPending(false); }
  }

  return <section className="user-admin">
    <h1>Nutzer verwalten</h1>
    {error && <p role="alert">{error}</p>}{success && <p role="status">{success}</p>}
    <table><thead><tr><th>Name</th><th>Benutzername</th><th>E-Mail</th><th>Rolle</th></tr></thead>
      <tbody>{users.map((user) => <tr key={user.id}><td>{user.name}</td><td>{user.username}</td><td>{user.email}</td><td>{user.role ?? "user"}</td></tr>)}</tbody>
    </table>
    <h2>Neuen Nutzer hinzufügen</h2>
    <form className="user-form" onSubmit={createUser}>
      <label>Name<input name="name" required /></label>
      <label>Benutzername<input name="username" required minLength={3} autoComplete="off" /></label>
      <label>E-Mail<input name="email" type="email" required /></label>
      <label>Passwort<input name="password" type="password" required minLength={8} autoComplete="new-password" /></label>
      <label>Rolle<select name="role" defaultValue="user"><option value="user">Nutzer</option><option value="admin">Admin</option></select></label>
      <Button type="Submit" design="Emphasized" disabled={pending}>Nutzer hinzufügen</Button>
    </form>
  </section>;
}
