-- CreateEnum
CREATE TYPE "RegisterDecision" AS ENUM ('pending', 'approved', 'sanctionedNoBlock', 'declined');

-- CreateEnum
CREATE TYPE "EtsCategory" AS ENUM ('ETS1', 'ETR1', 'ETS2', 'ETS3', 'ETS4', 'ETS5', 'ETS6');

-- CreateEnum
CREATE TYPE "RegisterStepKey" AS ENUM ('suser', 'tickets', 'remote', 'cloud', 'notify');

-- CreateEnum
CREATE TYPE "RegisterSpecialCategory" AS ENUM ('SR', 'Sonstige');

-- CreateTable
CREATE TABLE "RegisterPartner" (
    "id" TEXT NOT NULL,
    "bpId" TEXT NOT NULL,
    "erpId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "region" TEXT NOT NULL DEFAULT '',
    "ets" "EtsCategory" NOT NULL,
    "gtsBlockedAt" TIMESTAMP(3) NOT NULL,
    "gtsDateOnly" BOOLEAN NOT NULL DEFAULT false,
    "comment" TEXT NOT NULL DEFAULT '',
    "spl" BOOLEAN,
    "ruItConsultancyBan" BOOLEAN,
    "ukraineCrisis" BOOLEAN,
    "sanctionsList" TEXT NOT NULL DEFAULT '',
    "listReference" TEXT,
    "cloudCustomer" BOOLEAN NOT NULL DEFAULT false,
    "specialCategory" "RegisterSpecialCategory",
    "specialComment" TEXT,
    "enteredBy" TEXT NOT NULL,
    "enteredByUserId" TEXT,
    "decision" "RegisterDecision" NOT NULL DEFAULT 'pending',
    "decidedBy" TEXT,
    "decidedAt" TIMESTAMP(3),
    "decisionComment" TEXT,
    "sourceFile" TEXT,
    "sourceRow" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegisterPartner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegisterTenant" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "lob" TEXT NOT NULL,
    "product" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "ticket" TEXT NOT NULL,

    CONSTRAINT "RegisterTenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegisterStep" (
    "partnerId" TEXT NOT NULL,
    "key" "RegisterStepKey" NOT NULL,
    "at" TIMESTAMP(3) NOT NULL,
    "by" TEXT NOT NULL,
    "result" TEXT NOT NULL,

    CONSTRAINT "RegisterStep_pkey" PRIMARY KEY ("partnerId","key")
);

-- CreateTable
CREATE TABLE "RegisterAudit" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "by" TEXT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "RegisterAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegisterContact" (
    "id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "countries" TEXT[],
    "generalDirector" TEXT NOT NULL DEFAULT '',
    "legalHead" TEXT NOT NULL DEFAULT '',
    "commercialDirector" TEXT NOT NULL DEFAULT '',
    "lastChecked" TIMESTAMP(3),

    CONSTRAINT "RegisterContact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RegisterPartner_bpId_key" ON "RegisterPartner"("bpId");

-- CreateIndex
CREATE INDEX "RegisterPartner_country_idx" ON "RegisterPartner"("country");

-- CreateIndex
CREATE INDEX "RegisterPartner_ets_gtsBlockedAt_idx" ON "RegisterPartner"("ets", "gtsBlockedAt");

-- CreateIndex
CREATE INDEX "RegisterPartner_decision_idx" ON "RegisterPartner"("decision");

-- CreateIndex
CREATE INDEX "RegisterTenant_tenantId_idx" ON "RegisterTenant"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "RegisterTenant_partnerId_tenantId_key" ON "RegisterTenant"("partnerId", "tenantId");

-- CreateIndex
CREATE INDEX "RegisterAudit_partnerId_at_idx" ON "RegisterAudit"("partnerId", "at");

-- CreateIndex
CREATE UNIQUE INDEX "RegisterContact_region_key" ON "RegisterContact"("region");

-- AddForeignKey
ALTER TABLE "RegisterTenant" ADD CONSTRAINT "RegisterTenant_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "RegisterPartner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegisterStep" ADD CONSTRAINT "RegisterStep_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "RegisterPartner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegisterAudit" ADD CONSTRAINT "RegisterAudit_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "RegisterPartner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
