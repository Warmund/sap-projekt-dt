ALTER TABLE "RegisterPartner" ADD COLUMN "sanctionsLists" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
UPDATE "RegisterPartner" SET "sanctionsLists" = ARRAY["sanctionsList"] WHERE "sanctionsList" <> '';

CREATE TABLE "RegisterTag" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, CONSTRAINT "RegisterTag_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "RegisterTag_name_key" ON "RegisterTag"("name");
CREATE UNIQUE INDEX "RegisterTag_name_ci_key" ON "RegisterTag"(lower("name"));
CREATE TABLE "_RegisterPartnerToRegisterTag" ("A" TEXT NOT NULL, "B" TEXT NOT NULL);
CREATE UNIQUE INDEX "_RegisterPartnerToRegisterTag_AB_unique" ON "_RegisterPartnerToRegisterTag"("A", "B");
CREATE INDEX "_RegisterPartnerToRegisterTag_B_index" ON "_RegisterPartnerToRegisterTag"("B");
ALTER TABLE "_RegisterPartnerToRegisterTag" ADD CONSTRAINT "_RegisterPartnerToRegisterTag_A_fkey" FOREIGN KEY ("A") REFERENCES "RegisterPartner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_RegisterPartnerToRegisterTag" ADD CONSTRAINT "_RegisterPartnerToRegisterTag_B_fkey" FOREIGN KEY ("B") REFERENCES "RegisterTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
INSERT INTO "RegisterTag" ("id", "name") VALUES ('successroom', 'SuccessRoom');
INSERT INTO "_RegisterPartnerToRegisterTag" ("A", "B") SELECT "id", 'successroom' FROM "RegisterPartner" WHERE "specialCategory" = 'SR';
INSERT INTO "RegisterTag" ("id", "name") SELECT 'legacy-sonstige', 'Sonstige' WHERE EXISTS (SELECT 1 FROM "RegisterPartner" WHERE "specialCategory" = 'Sonstige');
INSERT INTO "_RegisterPartnerToRegisterTag" ("A", "B") SELECT "id", 'legacy-sonstige' FROM "RegisterPartner" WHERE "specialCategory" = 'Sonstige';
