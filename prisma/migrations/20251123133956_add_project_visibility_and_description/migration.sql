-- AlterTable
ALTER TABLE "project" ADD COLUMN     "description" TEXT,
ADD COLUMN     "visibility" TEXT NOT NULL DEFAULT 'public';
