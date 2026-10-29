"use client";

import { ThemeProvider } from "@ui5/webcomponents-react/ThemeProvider";
import { ShellBar } from "@ui5/webcomponents-react/ShellBar";

export default function Home() {
  return (
    <ThemeProvider>
      <header><ShellBar primaryTitle="SAP-Project-DT" /></header>
      <main />
    </ThemeProvider>
  );
}
