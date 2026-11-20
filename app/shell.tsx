"use client";
import { useLanguage } from "./language";
import { useEffect, useRef, useState } from "react";
import { boot } from "@ui5/webcomponents-base/dist/Boot.js";
import { ThemeProvider } from "@ui5/webcomponents-react/ThemeProvider";
import { NavigationLayout, type NavigationLayoutDomRef } from "@ui5/webcomponents-react/NavigationLayout";
import { ShellBar } from "@ui5/webcomponents-react/ShellBar";
import { ShellBarBranding } from "@ui5/webcomponents-react/ShellBarBranding";
import { SideNavigation } from "@ui5/webcomponents-react/SideNavigation";
import { SideNavigationItem } from "@ui5/webcomponents-react/SideNavigationItem";
import { SideNavigationGroup } from "@ui5/webcomponents-react/SideNavigationGroup";
import { Button } from "@ui5/webcomponents-react/Button";
import { Avatar } from "@ui5/webcomponents-react/Avatar";
import { UserMenu } from "@ui5/webcomponents-react/UserMenu";
import { UserMenuAccount } from "@ui5/webcomponents-react/UserMenuAccount";
import { UserMenuItem } from "@ui5/webcomponents-react/UserMenuItem";
import { MessageStrip } from "@ui5/webcomponents-react/MessageStrip";
import "@ui5/webcomponents-icons/dist/menu2.js";
import "@ui5/webcomponents-icons/dist/question-mark.js";
import "@ui5/webcomponents-icons/dist/bar-chart.js";
import "@ui5/webcomponents-icons/dist/list.js";
import "@ui5/webcomponents-icons/dist/add-document.js";
import "@ui5/webcomponents-icons/dist/contacts.js";
import "@ui5/webcomponents-icons/dist/email.js";
import "@ui5/webcomponents-icons/dist/people-connected.js";
import type { RegisterData } from "../lib/register/repository";
import { canEditWorkspace, workspaceRole } from "../lib/roles";
import { authClient } from "../lib/auth-client";
import { Administration } from "./administration";
import { RegisterProvider } from "./_register/store";
import { RegisterDashboard } from "./_register/dashboard";
import { RegisterList } from "./_register/register-list";
import { RegisterNewEntry } from "./_register/new-entry";
import { RegisterDetail } from "./_register/detail";
import { RegisterNotifications } from "./_register/notifications";
import { RegisterTasks } from "./_register/tasks";

import { Settings } from "./settings";
import "@ui5/webcomponents-icons/dist/action-settings.js";

import { WorkspaceLoading } from "./workspace-loading";
import { readWorkspaceView, type WorkspaceView } from "./workspace-view";

export function Shell({ user, initialRegister, initialView, initialPartnerId }: {
  user: { id: string; name: string; email: string; role: string };
  initialRegister: RegisterData;
  initialView: WorkspaceView;
  initialPartnerId?: string;
}) {
  const { t } = useLanguage();
  const layoutRef = useRef<NavigationLayoutDomRef>(null);
  const [mode, setMode] = useState<"Auto" | "Collapsed" | "Expanded">("Auto");
  const [view, setView] = useState(initialView);
  const [ready, setReady] = useState(false);
  const [menuOpener, setMenuOpener] = useState<HTMLElement | null>(null);
  const [error, setError] = useState("");
  const initials = user.name.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  useEffect(() => {
    let active = true;
    void boot().then(() => {
      if (active) setReady(true);
    });
    return () => { active = false; };
  }, []);

  function navigate(nextView: WorkspaceView, partnerId?: string) {
    setView(nextView);
    const url = new URL(window.location.href);
    if (nextView === "rg-dashboard") url.searchParams.delete("view");
    else url.searchParams.set("view", nextView);
    if (nextView === "rg-detail" && partnerId) url.searchParams.set("case", partnerId);
    else url.searchParams.delete("case");
    window.history.replaceState(null, "", url);
  }

  const signOut = async () => {
    setMenuOpener(null);
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error("Sign out failed");
      window.location.assign("/login");
    } catch { setError("Abmelden derzeit nicht möglich. Bitte versuche es erneut."); }
  };

  const role = workspaceRole(user.role);
  const canEdit = canEditWorkspace(role);
  const content = () => {
    switch (view) {
      case "settings": return <Settings />;
      case "users":
      case "rg-contacts":
      case "admin-imports":
      case "admin-cloud": return <Administration view={view} canEdit={canEdit} currentUserId={user.id} onSelect={navigate} />;
      case "rg-dashboard": return <RegisterDashboard />;
      case "rg-register": return <RegisterList />;
      case "rg-new": return canEdit ? <RegisterNewEntry /> : <RegisterDashboard />;
      case "rg-detail": return <RegisterDetail />;
      case "rg-notifications": return <RegisterNotifications />;
      case "rg-tasks": return <RegisterTasks />;
      default: return <RegisterDashboard />;
    }
  };

  if (!ready) return <WorkspaceLoading />;

  return <ThemeProvider>
    <RegisterProvider initialData={initialRegister} currentUser={user.name} role={role} initialPartnerId={initialPartnerId} onNavigate={navigate}>
    <NavigationLayout ref={layoutRef} mode={mode} className="app-layout"
      header={<ShellBar
        startButton={<Button icon="menu2" design="Transparent" tooltip={t("Navigation ein-/ausblenden")} accessibleName={t("Navigation ein-/ausblenden")}
          onClick={() => setMode(layoutRef.current?.isSideCollapsed() ? "Expanded" : "Collapsed")} />}
        branding={<ShellBarBranding logo={<img src="/sap-logo.svg" alt="SAP" />} onClick={() => navigate("rg-dashboard")}>SAP-Project-DT</ShellBarBranding>}
        secondaryTitle="Export Control"
        profile={<Avatar initials={initials} accessibleName={user.name} />}
        onProfileClick={(e) => setMenuOpener(e.detail.targetRef)} />}
      sideContent={<SideNavigation accessibleName={t("Hauptnavigation")}
        onSelectionChange={(e) => {
          navigate(readWorkspaceView(e.detail.item.dataset.key));
          // On size S the navigation is an overlay and should close after selection (Fiori guideline).
          if (window.matchMedia("(max-width: 599px)").matches) setMode("Collapsed");
        }}
        fixedItems={<SideNavigationItem text={t("Hilfe")} icon="question-mark" href="https://www.sap.com/design-system/fiori-design-web/" target="_blank" />}>
        <SideNavigationItem text="Dashboard" icon="bar-chart" data-key="rg-dashboard" selected={view === "rg-dashboard"} />
        <SideNavigationGroup text={t("Sanktionsregister")} expanded>
          <SideNavigationItem text={t("Register")} icon="list" data-key="rg-register" selected={view === "rg-register" || view === "rg-detail"} />
          <SideNavigationItem text={t("Benachrichtigungen")} icon="email" data-key="rg-notifications" selected={view === "rg-notifications"} />
          <SideNavigationItem text="Partner Teams" icon="people-connected" data-key="rg-tasks" selected={view === "rg-tasks"} />
          <SideNavigationItem text={t("Länder-Kontakte")} icon="contacts" data-key="rg-contacts" selected={view === "rg-contacts"} />
        </SideNavigationGroup>
        {canEdit && <SideNavigationGroup text="Administration" expanded>
          <SideNavigationItem text={t("Neuer Datensatz")} icon="add-document" data-key="rg-new" selected={view === "rg-new"} />
        </SideNavigationGroup>}
        <SideNavigationItem text={t("Einstellungen")} icon="action-settings" data-key="settings" selected={view === "settings"} />
      </SideNavigation>}>
      <main className="app-content">
        {error && <MessageStrip design="Negative" onClose={() => setError("")}>{t(error)}</MessageStrip>}
        {content()}
      </main>
    </NavigationLayout>
    </RegisterProvider>
    <UserMenu open={!!menuOpener} opener={menuOpener} onClose={() => setMenuOpener(null)} onSignOutClick={(e) => { e.preventDefault(); signOut(); }}
      accounts={<UserMenuAccount titleText={user.name} subtitleText={user.email} avatarInitials={initials} selected />}
      onItemClick={({ detail }) => {
        setMenuOpener(null);
        navigate(detail.item.dataset.key === "users" ? "users" : "admin-imports");
      }}>
      <UserMenuItem text="Administration" />
      <UserMenuItem text={t(canEdit ? "Nutzer verwalten" : "Nutzerliste")} data-key="users" />
    </UserMenu>
  </ThemeProvider>;
}
