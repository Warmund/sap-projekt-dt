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
    <header className="login-header">
      <img className="login-logo" src="/sap-logo.svg" width="88" height="44" alt="SAP" />
      <p className="login-eyebrow">EXPORT CONTROL</p>
      <h1>SAP-Project-DT</h1>
      <p className="login-intro">Willkommen zurück. Melde dich mit deinem Projektzugang an.</p>
    </header>
    <div className="login-field">
      <label htmlFor="username">Benutzername</label><input id="username" name="username" autoComplete="username" placeholder="Dein Benutzername" required />
    </div>
    <div className="login-field">
      <label htmlFor="password">Passwort</label><input id="password" name="password" type="password" autoComplete="current-password" placeholder="Dein Passwort" required />
    </div>
    {error && <p className="login-error" role="alert">{error}</p>}
    <div className="login-actions">
      <Button className="login-submit" design="Emphasized" type="Submit" disabled={pending}>{pending ? "Anmeldung läuft …" : "Anmelden"}</Button>
      <div className="login-divider"><span>oder</span></div>
      <Button className="login-sso" type="Button" disabled aria-describedby="sso-hint">SSO</Button>
      <p id="sso-hint" className="login-hint">Single Sign-on ist noch nicht verfügbar.</p>
    </div>
    <footer className="login-footer">SAP Export Control · Hochschulprojekt</footer>
  </form></main></ThemeProvider>;
}
