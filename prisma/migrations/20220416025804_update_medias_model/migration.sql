/*
  Warnings:

  - You are about to drop the column `absolutePath` on the `Medias` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Medias` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[path]` on the table `Medias` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Medias` table without a default value. This is not possible if the table is not empty.
  - Added the required column `path` to the `Medias` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Medias_absolutePath_key` ON `Medias`;

-- AlterTable
ALTER TABLE `Medias` DROP COLUMN `absolutePath`,
    ADD COLUMN `name` VARCHAR(191) NOT NULL,
    ADD COLUMN `path` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Medias_name_key` ON `Medias`(`name`);

-- CreateIndex
CREATE UNIQUE INDEX `Medias_path_key` ON `Medias`(`path`);
