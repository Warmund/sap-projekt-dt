"use client";
import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import { MessageStrip } from "@ui5/webcomponents-react/MessageStrip";
import { loadRegister, mutateRegister } from "./actions";
import type { RegisterFilter } from "../../lib/register/dashboard";
import type { RegisterCommand, RegisterData } from "../../lib/register/repository";
import type { BlockedPartner, CountryContact, Decision, StepKey, StepOrderVariant } from "../../lib/register/types";
import "./register.css";

export type RegisterView = "rg-dashboard" | "rg-register" | "rg-new" | "rg-detail" | "rg-tasks" | "rg-contacts";
type RegisterState = {
  partners: BlockedPartner[];
  contacts: CountryContact[];
  registerFilter: RegisterFilter;
  setRegisterFilter: (filter: RegisterFilter) => void;
  openRegister: (filter: RegisterFilter) => void;
  selected: BlockedPartner | undefined;
  currentUser: string;
  setStepOrder: (id: string, stepOrder: StepOrderVariant) => Promise<boolean>;
  open: (view: RegisterView, partnerId?: string) => void;
  decide: (id: string, decision: Exclude<Decision, "pending">, comment: string) => Promise<boolean>;
  completeStep: (id: string, step: StepKey, result?: string) => Promise<boolean>;
  advance: (id: string) => Promise<boolean>;
  addPartner: (p: BlockedPartner) => Promise<boolean>;
  updateContact: (c: CountryContact) => Promise<boolean>;
  reset: () => Promise<void>;
};
const Ctx = createContext<RegisterState | null>(null);

/** Database is authoritative; failed writes never become local success states. */
export function RegisterProvider({ children, currentUser, onNavigate, initialData }: { children: ReactNode; currentUser: string; onNavigate: (view: RegisterView) => void; initialData: RegisterData }) {
  const [data, setData] = useState(initialData);
  const [registerFilter, setRegisterFilter] = useState<RegisterFilter>("all");
  const [selectedId, setSelectedId] = useState<string | undefined>(initialData.partners[0]?.id);
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
    ...data, currentUser, registerFilter, setRegisterFilter,
    openRegister: (filter) => { setRegisterFilter(filter); onNavigate("rg-register"); }, selected: data.partners.find((p) => p.id === selectedId),
    setStepOrder: async (id, stepOrder) => !!await run({ kind: "setStepOrder", id, version: version(id), stepOrder }),
    open: (view, id) => { if (id) setSelectedId(id); onNavigate(view); },
    decide: async (id, decision, comment) => !!await run({ kind: "decide", id, version: version(id), decision, comment }),
    completeStep: async (id, step, result) => !!await run({ kind: "complete", id, version: version(id), step, result }),
    advance: async (id) => !!await run({ kind: "advance", id, version: version(id) }),
    addPartner: async (partner) => {
      const fresh = await run({ kind: "create", partner });
      if (fresh) setSelectedId(fresh.partners.find((p) => p.bpId === partner.bpId)?.id);
      return !!fresh;
    },
    updateContact: async (contact) => !!await run({ kind: "contact", contact }),
    reset: async () => {
      try { setData(await loadRegister()); setError(""); }
      catch { setError("Laden fehlgeschlagen. Bitte erneut anmelden oder später versuchen."); }
    },
  };
  return <Ctx.Provider value={value}>
    {saving && <MessageStrip hideCloseButton>Änderung wird gespeichert …</MessageStrip>}
    {error && <MessageStrip design="Negative" onClose={() => setError("")}>{error}</MessageStrip>}
    {children}
  </Ctx.Provider>;
}
export function useRegister() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useRegister außerhalb des RegisterProvider");
  return ctx;
}
