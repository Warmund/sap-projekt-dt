"use client";
import { useLanguage } from "../language";
import { useState, type FormEvent } from "react";
import { ThemeProvider } from "@ui5/webcomponents-react/ThemeProvider";
import { Button } from "@ui5/webcomponents-react/Button";
import { authClient } from "../../lib/auth-client";

import { LanguageSelect } from "../settings";

export default function Login() {
  const { t } = useLanguage();
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
      <p className="login-intro">{t("Willkommen zurück. Melde dich mit deinem Projektzugang an.")}</p>
    </header>
    <div className="login-field">
      <label htmlFor="username">{t("Benutzername")}</label><input id="username" name="username" autoComplete="username" placeholder={t("Dein Benutzername")} required />
    </div>
    <div className="login-field">
      <label htmlFor="password">{t("Passwort")}</label><input id="password" name="password" type="password" autoComplete="current-password" placeholder={t("Dein Passwort")} required />
    </div>
    {error && <p className="login-error" role="alert">{t(error)}</p>}
    <div className="login-actions">
      <Button className="login-submit" design="Emphasized" type="Submit" disabled={pending}>{pending ? t("Anmeldung läuft …") : t("Anmelden")}</Button>
      <div className="login-divider"><span>{t("oder")}</span></div>
      <Button className="login-sso" type="Button" disabled aria-describedby="sso-hint">SSO</Button>
      <p id="sso-hint" className="login-hint">{t("Single Sign-on ist noch nicht verfügbar.")}</p>
    </div>
    <LanguageSelect />
    <footer className="login-footer">{t("SAP Export Control · Hochschulprojekt")}</footer>
  </form></main></ThemeProvider>;
}
