"use client";

import { useLanguage } from "./language";

export function WorkspaceLoading() {
  const { t } = useLanguage();
  const label = t("Anwendung wird geladen");

  return <div className="workspace-loading">
    <div className="workspace-loading-header">
      {/* eslint-disable-next-line @next/next/no-img-element -- Static logo sized to match the app header. */}
      <img src="/sap-logo.svg" width={44} height={22} alt="SAP" />
      <span>SAP-Project-DT</span>
    </div>
    <div className="workspace-loading-status" role="status" aria-label={label}>
      <span className="workspace-loading-spinner" aria-hidden="true" />
      {label}
    </div>
  </div>;
}
