-- CreateTable
CREATE TABLE "OperationalRecord" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "departmentId" TEXT,
    "sourceType" "EmissionSourceType" NOT NULL,
    "description" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "recordDate" TIMESTAMP(3) NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "carbonTransactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OperationalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OperationalRecord_carbonTransactionId_key" ON "OperationalRecord"("carbonTransactionId");

-- CreateIndex
CREATE INDEX "OperationalRecord_organizationId_idx" ON "OperationalRecord"("organizationId");

-- CreateIndex
CREATE INDEX "OperationalRecord_departmentId_idx" ON "OperationalRecord"("departmentId");

-- CreateIndex
CREATE INDEX "OperationalRecord_processed_idx" ON "OperationalRecord"("processed");

-- AddForeignKey
ALTER TABLE "OperationalRecord" ADD CONSTRAINT "OperationalRecord_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationalRecord" ADD CONSTRAINT "OperationalRecord_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationalRecord" ADD CONSTRAINT "OperationalRecord_carbonTransactionId_fkey" FOREIGN KEY ("carbonTransactionId") REFERENCES "CarbonTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
