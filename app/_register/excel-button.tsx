"use client";
import { useState } from "react";
import { Button } from "@ui5/webcomponents-react/Button";
import { MessageStrip } from "@ui5/webcomponents-react/MessageStrip";
import "@ui5/webcomponents-icons/dist/excel-attachment.js";
import { downloadXlsx, exportFileName, type Sheet } from "../../lib/register/excel";
import { useLanguage } from "../language";

/** Lädt die gebauten Tabellenblätter als .xlsx herunter. Die Blätter werden erst beim Klick erzeugt. */
export function ExcelButton({ fileBase, build, disabled }: { fileBase: string; build: () => (Sheet | null)[]; disabled?: boolean }) {
  const { t } = useLanguage();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const run = async () => {
    setBusy(true); setFailed(false);
    try { await downloadXlsx(build(), exportFileName(fileBase)); }
    catch { setFailed(true); }
    finally { setBusy(false); }
  };
  return <>
    <Button icon="excel-attachment" design="Transparent" disabled={disabled || busy} onClick={run}>{t("Als Excel exportieren")}</Button>
    {failed && <MessageStrip design="Negative" onClose={() => setFailed(false)}>{t("Excel-Export fehlgeschlagen. Bitte erneut versuchen.")}</MessageStrip>}
  </>;
}
