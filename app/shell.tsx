"use client";
import { useEffect, useRef, useState } from "react";
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
import "@ui5/webcomponents-icons/dist/home.js";
import "@ui5/webcomponents-icons/dist/task.js";
import "@ui5/webcomponents-icons/dist/question-mark.js";
import "@ui5/webcomponents-icons/dist/bar-chart.js";
import "@ui5/webcomponents-icons/dist/list.js";
import "@ui5/webcomponents-icons/dist/add-document.js";
import "@ui5/webcomponents-icons/dist/people-connected.js";
import "@ui5/webcomponents-icons/dist/contacts.js";
import { authClient } from "../lib/auth-client";
import { Home } from "./home";
import { Todos, type Todo } from "./todos";
import { Users } from "./users";
import { RegisterProvider, type RegisterView } from "./_register/store";
import { RegisterDashboard } from "./_register/dashboard";
import { RegisterList } from "./_register/register-list";
import { RegisterNewEntry } from "./_register/new-entry";
import { RegisterDetail } from "./_register/detail";
import { RegisterTasks } from "./_register/tasks";
import { RegisterContacts } from "./_register/contacts";

type View = "home" | "todos" | "users" | RegisterView;
const STORAGE_KEY = "todos";

export function Shell({ user }: { user: { name: string; email: string; role: string } }) {
  const layoutRef = useRef<NavigationLayoutDomRef>(null);
  const [mode, setMode] = useState<"Auto" | "Collapsed" | "Expanded">("Auto");
  const [view, setView] = useState<View>("home");
  const [menuOpener, setMenuOpener] = useState<HTMLElement | null>(null);
  const [error, setError] = useState("");
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    // Restore browser-only data after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    try { setTodos(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]")); } catch { /* ignore corrupt storage */ }
  }, []);
  const saveTodos = (next: Todo[]) => { setTodos(next); localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); };

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
      case "users": return isAdmin ? <Users /> : null;
      case "todos": return <Todos todos={todos} onChange={saveTodos} />;
      case "rg-dashboard": return <RegisterDashboard />;
      case "rg-register": return <RegisterList />;
      case "rg-new": return <RegisterNewEntry />;
      case "rg-detail": return <RegisterDetail />;
      case "rg-tasks": return <RegisterTasks />;
      case "rg-contacts": return <RegisterContacts />;
      default: return <Home name={user.name} todos={todos} onOpenTodos={() => setView("todos")} />;
    }
  };

  return <ThemeProvider>
    <RegisterProvider currentUser={user.name} onNavigate={setView}>
    <NavigationLayout ref={layoutRef} mode={mode} className="app-layout"
      header={<ShellBar
        startButton={<Button icon="menu2" design="Transparent" tooltip="Navigation ein-/ausblenden" accessibleName="Navigation ein-/ausblenden"
          onClick={() => setMode(layoutRef.current?.isSideCollapsed() ? "Expanded" : "Collapsed")} />}
        branding={<ShellBarBranding logo={<img src="/sap-logo.svg" alt="SAP" />} onClick={() => setView("home")}>SAP-Project-DT</ShellBarBranding>}
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
        <SideNavigationItem text="Home" icon="home" data-key="home" selected={view === "home"} />
        <SideNavigationGroup text="Sanktionsregister" expanded>
          <SideNavigationItem text="Dashboard" icon="bar-chart" data-key="rg-dashboard" selected={view === "rg-dashboard"} />
          <SideNavigationItem text="Register" icon="list" data-key="rg-register" selected={view === "rg-register" || view === "rg-detail"} />
          <SideNavigationItem text="Neuer Datensatz" icon="add-document" data-key="rg-new" selected={view === "rg-new"} />
          <SideNavigationItem text="Nachbarabteilung" icon="people-connected" data-key="rg-tasks" selected={view === "rg-tasks"} />
          <SideNavigationItem text="Länder-Kontakte" icon="contacts" data-key="rg-contacts" selected={view === "rg-contacts"} />
        </SideNavigationGroup>
        <SideNavigationGroup text="Arbeitsbereich" expanded>
          <SideNavigationItem text="Aufgaben" icon="task" data-key="todos" selected={view === "todos"} />
        </SideNavigationGroup>
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
