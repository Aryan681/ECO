-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "profileImage" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "githubRepoId" INTEGER,
ADD COLUMN     "githubUrl" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "githubAccessToken" TEXT;
