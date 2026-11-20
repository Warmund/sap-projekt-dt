"use client";
import { useLanguage } from "../language";
import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import { MessageStrip } from "@ui5/webcomponents-react/MessageStrip";
import type { WorkspaceRole } from "../../lib/roles";
import { loadRegister, mutateRegister } from "./actions";
import type { RegisterFilter } from "../../lib/register/dashboard";
import type { RegisterCommand, RegisterData } from "../../lib/register/repository";
import type { BlockedPartner, CountryContact, Decision, StepKey } from "../../lib/register/types";
import "./register.css";

export type RegisterView = "rg-dashboard" | "rg-register" | "rg-new" | "rg-detail" | "rg-tasks" | "rg-contacts" | "rg-notifications";
type RegisterState = {
  partners: BlockedPartner[];
  contacts: CountryContact[];
  registerFilter: RegisterFilter;
  setRegisterFilter: (filter: RegisterFilter) => void;
  openRegister: (filter: RegisterFilter) => void;
  selected: BlockedPartner | undefined;
  currentUser: string;
  role: WorkspaceRole;
  open: (view: RegisterView, partnerId?: string) => void;
  decide: (id: string, decision: Exclude<Decision, "pending">, comment: string) => Promise<boolean>;
  completeStep: (id: string, step: StepKey, result?: string) => Promise<boolean>;
  confirmNotifications: (customers: { id: string; version: number }[]) => Promise<boolean>;
  addPartnerFromGts: (bpId: string) => Promise<string | undefined>;
  updateContact: (c: CountryContact) => Promise<boolean>;
  reset: () => Promise<void>;
};
const Ctx = createContext<RegisterState | null>(null);

/** Database is authoritative; failed writes never become local success states. */
export function RegisterProvider({ children, currentUser, role, onNavigate, initialData, initialPartnerId }: { children: ReactNode; currentUser: string; role: WorkspaceRole; onNavigate: (view: RegisterView, partnerId?: string) => void; initialData: RegisterData; initialPartnerId?: string }) {
  const { t } = useLanguage();
  const [data, setData] = useState(initialData);
  const [registerFilter, setRegisterFilter] = useState<RegisterFilter>("all");
  const [selectedId, setSelectedId] = useState(initialPartnerId);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const busy = useRef(false);
  const run = async (command: RegisterCommand) => {
    if (busy.current) return null;
    busy.current = true; setSaving(true); setError("");
    try {
      const result = await mutateRegister(command);
      if (!result.data) throw new Error(result.error);
      setData(result.data);
      return result.data;
    } catch (e) { setError(e instanceof Error ? e.message : "Speichern fehlgeschlagen."); return null; }
    finally { busy.current = false; setSaving(false); }
  };
  const version = (id: string) => data.partners.find((p) => p.id === id)?.version ?? -1;
  const value: RegisterState = {
    ...data, currentUser, role, registerFilter, setRegisterFilter,
    openRegister: (filter) => { setRegisterFilter(filter); onNavigate("rg-register"); }, selected: data.partners.find((p) => p.id === selectedId),
    open: (view, id) => { if (id) setSelectedId(id); onNavigate(view, id); },
    decide: async (id, decision, comment) => !!await run({ kind: "decide", id, version: version(id), decision, comment }),
    completeStep: async (id, step, result) => !!await run({ kind: "complete", id, version: version(id), step, result }),
    confirmNotifications: async (customers) => !!await run({ kind: "confirmNotifications", customers }),
    addPartnerFromGts: async (bpId) => {
      const fresh = await run({ kind: "createFromGts", bpId });
      return fresh?.partners.find((p) => p.bpId === bpId)?.id;
    },
    updateContact: async (contact) => !!await run({ kind: "contact", contact }),
    reset: async () => {
      try { setData(await loadRegister()); setError(""); }
      catch { setError("Laden fehlgeschlagen. Bitte erneut anmelden oder später versuchen."); }
    },
  };
  return <Ctx.Provider value={value}>
    {saving && <MessageStrip hideCloseButton>{t("Änderung wird gespeichert …")}</MessageStrip>}
    {error && <MessageStrip design="Negative" onClose={() => setError("")}>{t(error)}</MessageStrip>}
    {children}
  </Ctx.Provider>;
}
export function useRegister() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useRegister außerhalb des RegisterProvider");
  return ctx;
}
