/*
  Warnings:

  - You are about to drop the column `facilityId` on the `Bookings` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Bookings` DROP FOREIGN KEY `Bookings_facilityId_fkey`;

-- AlterTable
ALTER TABLE `Bookings` DROP COLUMN `facilityId`;
