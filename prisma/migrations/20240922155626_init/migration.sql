-- DropForeignKey
ALTER TABLE "Token" DROP CONSTRAINT "Token_crateId_fkey";

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_crateId_fkey" FOREIGN KEY ("crateId") REFERENCES "Crate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
