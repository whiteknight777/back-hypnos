/*
  Warnings:

  - You are about to drop the column `roomId` on the `Services` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Services` DROP FOREIGN KEY `Services_roomId_fkey`;

-- DropIndex
DROP INDEX `Medias_name_key` ON `Medias`;

-- AlterTable
ALTER TABLE `Services` DROP COLUMN `roomId`;

-- CreateTable
CREATE TABLE `RoomServices` (
    `roomId` VARCHAR(191) NOT NULL,
    `serviceId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`roomId`, `serviceId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RoomServices` ADD CONSTRAINT `RoomServices_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Rooms`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoomServices` ADD CONSTRAINT `RoomServices_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Services`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
