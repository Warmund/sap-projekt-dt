CREATE TYPE "RegisterStepOrder" AS ENUM ('A', 'B');

ALTER TABLE "RegisterPartner"
ADD COLUMN "stepOrder" "RegisterStepOrder" NOT NULL DEFAULT 'A';

-- Preserve evidence of tickets-first processing in existing cases.
UPDATE "RegisterPartner" AS partner
SET "stepOrder" = 'B'
FROM "RegisterStep" AS tickets
WHERE tickets."partnerId" = partner."id"
  AND tickets."key" = 'tickets'
  AND NOT EXISTS (
    SELECT 1 FROM "RegisterStep" AS suser
    WHERE suser."partnerId" = partner."id"
      AND suser."key" = 'suser'
      AND suser."at" <= tickets."at"
  );
