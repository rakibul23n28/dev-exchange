/*
  Warnings:

  - You are about to drop the column `dislikes` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `likes` on the `Post` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "VoteType" AS ENUM ('LIKE', 'DISLIKE');

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "dislikes",
DROP COLUMN "likes";

-- CreateTable
CREATE TABLE "PostVote" (
    "id" TEXT NOT NULL,
    "type" "VoteType" NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,

    CONSTRAINT "PostVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PostVote_postId_idx" ON "PostVote"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "PostVote_userId_postId_key" ON "PostVote"("userId", "postId");

-- AddForeignKey
ALTER TABLE "PostVote" ADD CONSTRAINT "PostVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostVote" ADD CONSTRAINT "PostVote_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
