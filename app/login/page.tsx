"use client";
import { useState, type FormEvent } from "react";
import { ThemeProvider } from "@ui5/webcomponents-react/ThemeProvider";
import { Button } from "@ui5/webcomponents-react/Button";
import { authClient } from "../../lib/auth-client";

export default function Login() {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const form = new FormData(event.currentTarget);
    try {
      const result = await authClient.signIn.username({ username: String(form.get("username")), password: String(form.get("password")) });
      if (result.error) setError("Anmeldung nicht möglich. Bitte überprüfe deine Zugangsdaten.");
      else window.location.assign("/");
    } catch {
      setError("Anmeldung derzeit nicht verfügbar. Bitte versuche es später erneut.");
    } finally { setPending(false); }
  }
  return <ThemeProvider><main className="login-page"><form className="login-card" onSubmit={submit}>
    <h1>SAP-Project-DT</h1><p>Demo-Anmeldung</p>
    <label htmlFor="username">Benutzername</label><input id="username" name="username" autoComplete="username" required />
    <label htmlFor="password">Passwort</label><input id="password" name="password" type="password" autoComplete="current-password" required />
    {error && <p role="alert">{error}</p>}
    <Button design="Emphasized" type="Submit" disabled={pending}>{pending ? "Anmeldung läuft …" : "Anmelden"}</Button>
  </form></main></ThemeProvider>;
}
