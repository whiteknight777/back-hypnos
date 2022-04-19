/*
  Warnings:

  - A unique constraint covering the columns `[gerantId]` on the table `Facilities` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Facilities` ADD COLUMN `gerantId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Facilities_gerantId_key` ON `Facilities`(`gerantId`);

-- AddForeignKey
ALTER TABLE `Facilities` ADD CONSTRAINT `Facilities_gerantId_fkey` FOREIGN KEY (`gerantId`) REFERENCES `Users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
