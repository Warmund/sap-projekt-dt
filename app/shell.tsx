"use client";
import { useRef, useState } from "react";
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
import "@ui5/webcomponents-icons/dist/action-settings.js";
import "@ui5/webcomponents-icons/dist/people-connected.js";
import type { RegisterData } from "../lib/register/repository";
import { authClient } from "../lib/auth-client";
import { Administration, type AdministrationView } from "./administration";
import { RegisterProvider, type RegisterView } from "./_register/store";
import { RegisterDashboard } from "./_register/dashboard";
import { RegisterList } from "./_register/register-list";
import { RegisterNewEntry } from "./_register/new-entry";
import { RegisterDetail } from "./_register/detail";
import { RegisterTasks } from "./_register/tasks";

type View = AdministrationView | RegisterView;

export function Shell({ user, initialRegister }: { user: { name: string; email: string; role: string }; initialRegister: RegisterData }) {
  const layoutRef = useRef<NavigationLayoutDomRef>(null);
  const [mode, setMode] = useState<"Auto" | "Collapsed" | "Expanded">("Auto");
  const [view, setView] = useState<View>("rg-dashboard");
  const [menuOpener, setMenuOpener] = useState<HTMLElement | null>(null);
  const [error, setError] = useState("");
  const initials = user.name.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  const signOut = async () => {
    setMenuOpener(null);
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error("Sign out failed");
      window.location.assign("/login");
    } catch { setError("Abmelden derzeit nicht möglich. Bitte versuche es erneut."); }
  };

  const isAdmin = user.role.split(",").includes("admin");
  const content = () => {
    switch (view) {
      case "users":
      case "rg-contacts":
      case "admin-imports":
      case "admin-cloud": return <Administration view={view} isAdmin={isAdmin} onSelect={setView} />;
      case "rg-dashboard": return <RegisterDashboard />;
      case "rg-register": return <RegisterList />;
      case "rg-new": return <RegisterNewEntry />;
      case "rg-detail": return <RegisterDetail />;
      case "rg-tasks": return <RegisterTasks />;
      default: return <RegisterDashboard />;
    }
  };

  return <ThemeProvider>
    <RegisterProvider initialData={initialRegister} currentUser={user.name} onNavigate={setView}>
    <NavigationLayout ref={layoutRef} mode={mode} className="app-layout"
      header={<ShellBar
        startButton={<Button icon="menu2" design="Transparent" tooltip="Navigation ein-/ausblenden" accessibleName="Navigation ein-/ausblenden"
          onClick={() => setMode(layoutRef.current?.isSideCollapsed() ? "Expanded" : "Collapsed")} />}
        branding={<ShellBarBranding logo={<img src="/sap-logo.svg" alt="SAP" />} onClick={() => setView("rg-dashboard")}>SAP-Project-DT</ShellBarBranding>}
        secondaryTitle="Export Control"
        profile={<Avatar initials={initials} accessibleName={user.name} />}
        onProfileClick={(e) => setMenuOpener(e.detail.targetRef)} />}
      sideContent={<SideNavigation accessibleName="Hauptnavigation"
        onSelectionChange={(e) => {
          setView(e.detail.item.dataset.key as View);
          // On size S the navigation is an overlay and should close after selection (Fiori guideline).
          if (window.matchMedia("(max-width: 599px)").matches) setMode("Collapsed");
        }}
        fixedItems={<SideNavigationItem text="Hilfe" icon="question-mark" href="https://www.sap.com/design-system/fiori-design-web/" target="_blank" />}>
        <SideNavigationItem text="Dashboard" icon="bar-chart" data-key="rg-dashboard" selected={view === "rg-dashboard"} />
        <SideNavigationGroup text="Sanktionsregister" expanded>
          <SideNavigationItem text="Register" icon="list" data-key="rg-register" selected={view === "rg-register" || view === "rg-detail" || view === "rg-new"} />
          <SideNavigationItem text="Nachbarabteilung" icon="people-connected" data-key="rg-tasks" selected={view === "rg-tasks"} />
        </SideNavigationGroup>
        <SideNavigationItem text="Administration" icon="action-settings" data-key="admin-imports"
          selected={view === "admin-imports" || view === "admin-cloud" || view === "rg-contacts" || view === "users"} />
      </SideNavigation>}>
      <main className="app-content">
        {error && <MessageStrip design="Negative" onClose={() => setError("")}>{error}</MessageStrip>}
        {content()}
      </main>
    </NavigationLayout>
    </RegisterProvider>
    <UserMenu open={!!menuOpener} opener={menuOpener} onClose={() => setMenuOpener(null)} onSignOutClick={(e) => { e.preventDefault(); signOut(); }}
      accounts={<UserMenuAccount titleText={user.name} subtitleText={user.email} avatarInitials={initials} selected />}
      onItemClick={() => { setMenuOpener(null); setView("users"); }}>
      {isAdmin && <UserMenuItem text="Nutzer verwalten" />}
    </UserMenu>
  </ThemeProvider>;
}
