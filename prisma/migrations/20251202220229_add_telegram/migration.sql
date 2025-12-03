-- CreateTable
CREATE TABLE "TelegramToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TelegramToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTelegram" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserTelegram_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TelegramToken_token_key" ON "TelegramToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "UserTelegram_chatId_key" ON "UserTelegram"("chatId");

-- CreateIndex
CREATE UNIQUE INDEX "UserTelegram_userId_key" ON "UserTelegram"("userId");

-- AddForeignKey
ALTER TABLE "TelegramToken" ADD CONSTRAINT "TelegramToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTelegram" ADD CONSTRAINT "UserTelegram_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
