-- CreateTable
CREATE TABLE "Aggregates" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "eventsTotal" INTEGER NOT NULL DEFAULT 0,
    "eventsCreated" INTEGER NOT NULL DEFAULT 0,
    "eventsUpdated" INTEGER NOT NULL DEFAULT 0,
    "eventsCancelled" INTEGER NOT NULL DEFAULT 0,
    "ticketsBooked" INTEGER NOT NULL DEFAULT 0,
    "ticketsCancelled" INTEGER NOT NULL DEFAULT 0,
    "ticketsAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paymentsProcessed" INTEGER NOT NULL DEFAULT 0,
    "paymentsFailed" INTEGER NOT NULL DEFAULT 0,
    "paymentsRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Aggregates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngestedMessage" (
    "messageId" TEXT NOT NULL,
    "routingKey" TEXT NOT NULL,
    "payload" JSONB,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IngestedMessage_pkey" PRIMARY KEY ("messageId")
);
