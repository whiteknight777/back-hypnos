/*
  Warnings:

  - A unique constraint covering the columns `[filename]` on the table `Medias` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `filename` to the `Medias` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Medias` ADD COLUMN `filename` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Medias_filename_key` ON `Medias`(`filename`);
