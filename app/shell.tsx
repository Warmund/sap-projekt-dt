"use client";
import { useState } from "react";
import { ThemeProvider } from "@ui5/webcomponents-react/ThemeProvider";
import { ShellBar } from "@ui5/webcomponents-react/ShellBar";
import { Button } from "@ui5/webcomponents-react/Button";
import "@ui5/webcomponents-icons/dist/log.js";
import { authClient } from "../lib/auth-client";

export function Shell() {
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");
  return <ThemeProvider>
    <header className="workspace-shell">
      <ShellBar primaryTitle="SAP-Project-DT" secondaryTitle="Export Control" logo={<img src="/sap-logo.svg" width="60" height="30" alt="SAP" />} />
      <Button design="Transparent" icon="log" disabled={signingOut} onClick={async () => {
        setSigningOut(true);
        try {
          const result = await authClient.signOut();
          if (result.error) throw new Error("Sign out failed");
          window.location.assign("/login");
        } catch { setError("Abmelden derzeit nicht möglich. Bitte versuche es erneut."); setSigningOut(false); }
      }}>Abmelden</Button>
    </header>
    <main>{error && <p role="alert">{error}</p>}</main>
  </ThemeProvider>;
}