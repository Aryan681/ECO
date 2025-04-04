-- CreateTable
CREATE TABLE "SpotifyAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "spotifyId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "scope" TEXT NOT NULL,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "displayName" TEXT,
    "email" TEXT,
    "country" TEXT,
    "product" TEXT,
    "avatarUrl" TEXT,

    CONSTRAINT "SpotifyAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SpotifyAccount_userId_key" ON "SpotifyAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SpotifyAccount_spotifyId_key" ON "SpotifyAccount"("spotifyId");

-- AddForeignKey
ALTER TABLE "SpotifyAccount" ADD CONSTRAINT "SpotifyAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
