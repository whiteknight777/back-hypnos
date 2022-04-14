/*
  Warnings:

  - You are about to alter the column `role` on the `Users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum("Users_role")`.

*/
-- AlterTable
ALTER TABLE `Users` MODIFY `role` ENUM('CLIENT', 'ADMIN', 'GERANT') NOT NULL DEFAULT 'CLIENT';
