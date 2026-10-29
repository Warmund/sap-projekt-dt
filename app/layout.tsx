import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = { title: "SAP Projekt" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="de"><body>{children}<Analytics /></body></html>;
}
