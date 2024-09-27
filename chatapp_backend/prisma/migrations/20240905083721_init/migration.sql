/*
  Warnings:

  - You are about to drop the column `chatName` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `groupAdminId` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `isGroupChat` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `latstMessageId` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Message` table. All the data in the column will be lost.
  - Added the required column `text` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_groupAdminId_fkey";

-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_latstMessageId_fkey";

-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "chatName",
DROP COLUMN "groupAdminId",
DROP COLUMN "isGroupChat",
DROP COLUMN "latstMessageId",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "content",
ADD COLUMN     "text" TEXT NOT NULL;
