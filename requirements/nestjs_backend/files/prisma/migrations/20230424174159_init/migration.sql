-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL,
    "First_Name" TEXT NOT NULL,
    "Last_Name" TEXT NOT NULL,
    "User_Name" TEXT NOT NULL,
    "User_Pw" TEXT NOT NULL,
    "Email" TEXT NOT NULL,
    "Avatar" TEXT,
    "User_Status" TEXT NOT NULL DEFAULT 'online',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User_stats" (
    "id" SERIAL NOT NULL,
    "Wins" INTEGER NOT NULL,
    "Losses" INTEGER NOT NULL,
    "PlayerId" INTEGER NOT NULL,
    "MMR" INTEGER NOT NULL DEFAULT 0,
    "Friendlist" TEXT[],

    CONSTRAINT "User_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievements" (
    "id" SERIAL NOT NULL,
    "Stats_Id" INTEGER NOT NULL,
    "exists" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Matches" (
    "id" SERIAL NOT NULL,
    "Stats_Id" INTEGER NOT NULL,
    "Type" TEXT NOT NULL,
    "Outcome" BOOLEAN,
    "Result" INTEGER[] DEFAULT ARRAY[0, 0]::INTEGER[],
    "startTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Matches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_User_Name_key" ON "User"("User_Name");

-- CreateIndex
CREATE UNIQUE INDEX "User_Email_key" ON "User"("Email");

-- AddForeignKey
ALTER TABLE "User_stats" ADD CONSTRAINT "User_stats_PlayerId_fkey" FOREIGN KEY ("PlayerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Achievements" ADD CONSTRAINT "Achievements_Stats_Id_fkey" FOREIGN KEY ("Stats_Id") REFERENCES "User_stats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Matches" ADD CONSTRAINT "Matches_Stats_Id_fkey" FOREIGN KEY ("Stats_Id") REFERENCES "User_stats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
