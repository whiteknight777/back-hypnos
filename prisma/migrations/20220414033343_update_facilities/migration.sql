/*
  Warnings:

  - Added the required column `facilityId` to the `Rooms` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Rooms` ADD COLUMN `facilityId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Rooms` ADD CONSTRAINT `Rooms_facilityId_fkey` FOREIGN KEY (`facilityId`) REFERENCES `Facilities`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
