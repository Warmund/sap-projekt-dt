import type { BlockedPartner } from "./types";

export type GtsPartner = Pick<BlockedPartner,
  "bpId" | "erpId" | "name" | "country" | "region" | "gtsBlockedAt" | "gtsDateOnly" |
  "ets" | "sanctionsList" | "sanctionsLists" | "listReference" | "spl" | "ruItConsultancyBan" | "ukraineCrisis" |
  "cloudCustomer" | "tenants" | "specialCategory" | "specialComment" | "comment"
>;

export const GTS_DEMO_IDS = ["1000611", "1000612"] as const;

const DEMO_PARTNERS: readonly GtsPartner[] = [
  {
    bpId: GTS_DEMO_IDS[0], erpId: "4912-CN", name: "Seidenstraße Components Co., Ltd.",
    country: "China", region: "Greater China", gtsBlockedAt: "2026-11-20T08:30:00.000Z",
    ets: "ETS4", sanctionsList: "US-SDN-Liste", sanctionsLists: ["US-SDN-Liste", "EU-Sanktionsliste"], listReference: "DEMO-SDN-4912",
    spl: true, ruItConsultancyBan: false, ukraineCrisis: false,
    specialCategory: null, comment: "",
    cloudCustomer: true, tenants: [
      { lob: "SuccessFactors", product: "Employee Central", tenantId: "TEN-9921", ticket: "" },
      { lob: "Cloud ERP", product: "S/4HANA Cloud", tenantId: "TEN-9930", ticket: "" },
    ],
  },
  {
    bpId: GTS_DEMO_IDS[1], erpId: "4913-AT", name: "Alpenblick Handel GmbH",
    country: "Österreich", region: "DACH", gtsBlockedAt: "2026-11-20T09:15:00.000Z",
    ets: "ETS3", sanctionsList: "EU-Sanktionsliste", sanctionsLists: ["EU-Sanktionsliste"], listReference: "DEMO-EU-4913",
    spl: false, ruItConsultancyBan: false, ukraineCrisis: false,
    specialCategory: "SR", comment: "",
    cloudCustomer: false, tenants: [],
  },
];

export function findGtsPartner(bpId: string): GtsPartner | undefined {
  return DEMO_PARTNERS.find((partner) => partner.bpId === bpId);
}
