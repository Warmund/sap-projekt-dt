"use client";
import { ThemeProvider } from "@ui5/webcomponents-react/ThemeProvider";
import { ShellBar } from "@ui5/webcomponents-react/ShellBar";
import { Button } from "@ui5/webcomponents-react/Button";
import { authClient } from "../lib/auth-client";

export function Shell() {
  return <ThemeProvider><header><ShellBar primaryTitle="SAP-Project-DT" /></header>
    <main><Button onClick={async () => { await authClient.signOut(); window.location.assign("/login"); }}>Abmelden</Button></main>
  </ThemeProvider>;
}
