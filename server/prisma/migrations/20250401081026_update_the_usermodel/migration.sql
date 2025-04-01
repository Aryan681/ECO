/*
  Warnings:

  - You are about to drop the column `authProvider` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "authProvider",
ADD COLUMN     "authMethod" TEXT NOT NULL DEFAULT 'local';
