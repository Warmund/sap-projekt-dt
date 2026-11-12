"use client";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { MOCK_PARTNERS, mockContacts } from "../../lib/register/mock-data";
import { advance, completeStep, decide } from "../../lib/register/workflow";
import type { BlockedPartner, CountryContact, Decision, StepKey, StepOrderVariant } from "../../lib/register/types";
import "./register.css";

export type RegisterView = "rg-dashboard" | "rg-register" | "rg-new" | "rg-detail" | "rg-tasks" | "rg-contacts";

type RegisterState = {
  partners: BlockedPartner[];
  contacts: CountryContact[];
  variant: StepOrderVariant;
  selected: BlockedPartner | undefined;
  currentUser: string;
  setVariant: (v: StepOrderVariant) => void;
  open: (view: RegisterView, partnerId?: string) => void;
  decide: (id: string, decision: Exclude<Decision, "pending">, comment: string) => void;
  completeStep: (id: string, step: StepKey, result?: string) => void;
  advance: (id: string) => void;
  addPartner: (p: BlockedPartner) => void;
  updateContact: (c: CountryContact) => void;
  reset: () => void;
};

const Ctx = createContext<RegisterState | null>(null);

/** Hält den Demo-Zustand im Browser. Es wird nichts in der Datenbank gespeichert. */
export function RegisterProvider({ children, currentUser, onNavigate }: { children: ReactNode; currentUser: string; onNavigate: (view: RegisterView) => void }) {
  const [partners, setPartners] = useState<BlockedPartner[]>(MOCK_PARTNERS);
  const [contacts, setContacts] = useState<CountryContact[]>(mockContacts);
  const [variant, setVariant] = useState<StepOrderVariant>("A");
  const [selectedId, setSelectedId] = useState<string>(MOCK_PARTNERS[0].id);

  const value = useMemo<RegisterState>(() => {
    const update = (id: string, fn: (p: BlockedPartner) => BlockedPartner) =>
      setPartners((all) => all.map((p) => (p.id === id ? fn(p) : p)));
    return {
      partners, contacts, variant, currentUser,
      selected: partners.find((p) => p.id === selectedId),
      setVariant,
      open: (view, partnerId) => { if (partnerId) setSelectedId(partnerId); onNavigate(view); },
      decide: (id, decision, comment) => update(id, (p) => decide(p, decision, currentUser, comment)),
      completeStep: (id, step, result) => update(id, (p) => completeStep(p, step, variant, currentUser, result)),
      advance: (id) => update(id, (p) => advance(p, variant)),
      addPartner: (p) => { setPartners((all) => [p, ...all]); setSelectedId(p.id); },
      updateContact: (c) => setContacts((all) => all.map((x) => (x.id === c.id ? c : x))),
      reset: () => { setPartners(MOCK_PARTNERS); setContacts(mockContacts()); },
    };
  }, [partners, contacts, variant, selectedId, currentUser, onNavigate]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useRegister() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useRegister außerhalb des RegisterProvider");
  return ctx;
}
