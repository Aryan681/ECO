/*
  Warnings:

  - Added the required column `duration` to the `PomodoroSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PomodoroSession" ADD COLUMN     "duration" INTEGER NOT NULL;
