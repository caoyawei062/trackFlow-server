/*
  Warnings:

  - You are about to alter the column `completed` on the `Task` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `Double`.

*/
-- DropIndex
DROP INDEX `Task_dueDate_priority_idx` ON `Task`;

-- AlterTable
ALTER TABLE `Task` MODIFY `completed` DOUBLE NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX `Task_priority_idx` ON `Task`(`priority`);
