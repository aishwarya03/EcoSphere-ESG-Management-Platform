-- CreateEnum
CREATE TYPE "ParticipationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ChallengeDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "ChallengeStatus" AS ENUM ('DRAFT', 'ACTIVE', 'UNDER_REVIEW', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AuditStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "IssueSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "IssueStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateTable
CREATE TABLE "CarbonTransaction" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "departmentId" TEXT,
    "emissionFactorId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "calculatedEmissionsKgCo2e" DOUBLE PRECISION NOT NULL,
    "transactionDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarbonTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CSRActivity" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT,
    "departmentId" TEXT,
    "pointsValue" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" "EntityStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CSRActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeParticipation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "csrActivityId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "proof" TEXT,
    "approvalStatus" "ParticipationStatus" NOT NULL DEFAULT 'PENDING',
    "pointsEarned" INTEGER,
    "completionDate" TIMESTAMP(3) NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeParticipation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Challenge" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT,
    "xp" INTEGER NOT NULL,
    "difficulty" "ChallengeDifficulty" NOT NULL,
    "evidenceRequired" BOOLEAN NOT NULL DEFAULT false,
    "deadline" TIMESTAMP(3) NOT NULL,
    "status" "ChallengeStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Challenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChallengeParticipation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "proof" TEXT,
    "approvalStatus" "ParticipationStatus" NOT NULL DEFAULT 'PENDING',
    "xpAwarded" INTEGER,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChallengeParticipation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PolicyAcknowledgement" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "esgPolicyId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "policyVersion" INTEGER NOT NULL,
    "acknowledgedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PolicyAcknowledgement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Audit" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "departmentId" TEXT,
    "auditor" TEXT,
    "auditDate" TIMESTAMP(3) NOT NULL,
    "status" "AuditStatus" NOT NULL DEFAULT 'PLANNED',
    "findingsSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceIssue" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "severity" "IssueSeverity" NOT NULL,
    "description" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "IssueStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplianceIssue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepartmentScore" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "environmentalScore" DOUBLE PRECISION NOT NULL,
    "socialScore" DOUBLE PRECISION NOT NULL,
    "governanceScore" DOUBLE PRECISION NOT NULL,
    "totalScore" DOUBLE PRECISION NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DepartmentScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CarbonTransaction_organizationId_idx" ON "CarbonTransaction"("organizationId");

-- CreateIndex
CREATE INDEX "CarbonTransaction_departmentId_idx" ON "CarbonTransaction"("departmentId");

-- CreateIndex
CREATE INDEX "CarbonTransaction_emissionFactorId_idx" ON "CarbonTransaction"("emissionFactorId");

-- CreateIndex
CREATE INDEX "CSRActivity_organizationId_idx" ON "CSRActivity"("organizationId");

-- CreateIndex
CREATE INDEX "CSRActivity_departmentId_idx" ON "CSRActivity"("departmentId");

-- CreateIndex
CREATE INDEX "EmployeeParticipation_organizationId_idx" ON "EmployeeParticipation"("organizationId");

-- CreateIndex
CREATE INDEX "EmployeeParticipation_csrActivityId_idx" ON "EmployeeParticipation"("csrActivityId");

-- CreateIndex
CREATE INDEX "EmployeeParticipation_employeeId_idx" ON "EmployeeParticipation"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeParticipation_employeeId_csrActivityId_key" ON "EmployeeParticipation"("employeeId", "csrActivityId");

-- CreateIndex
CREATE INDEX "Challenge_organizationId_idx" ON "Challenge"("organizationId");

-- CreateIndex
CREATE INDEX "ChallengeParticipation_organizationId_idx" ON "ChallengeParticipation"("organizationId");

-- CreateIndex
CREATE INDEX "ChallengeParticipation_challengeId_idx" ON "ChallengeParticipation"("challengeId");

-- CreateIndex
CREATE INDEX "ChallengeParticipation_employeeId_idx" ON "ChallengeParticipation"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeParticipation_employeeId_challengeId_key" ON "ChallengeParticipation"("employeeId", "challengeId");

-- CreateIndex
CREATE INDEX "PolicyAcknowledgement_organizationId_idx" ON "PolicyAcknowledgement"("organizationId");

-- CreateIndex
CREATE INDEX "PolicyAcknowledgement_esgPolicyId_idx" ON "PolicyAcknowledgement"("esgPolicyId");

-- CreateIndex
CREATE UNIQUE INDEX "PolicyAcknowledgement_employeeId_esgPolicyId_policyVersion_key" ON "PolicyAcknowledgement"("employeeId", "esgPolicyId", "policyVersion");

-- CreateIndex
CREATE INDEX "Audit_organizationId_idx" ON "Audit"("organizationId");

-- CreateIndex
CREATE INDEX "Audit_departmentId_idx" ON "Audit"("departmentId");

-- CreateIndex
CREATE INDEX "ComplianceIssue_organizationId_idx" ON "ComplianceIssue"("organizationId");

-- CreateIndex
CREATE INDEX "ComplianceIssue_auditId_idx" ON "ComplianceIssue"("auditId");

-- CreateIndex
CREATE INDEX "ComplianceIssue_ownerId_idx" ON "ComplianceIssue"("ownerId");

-- CreateIndex
CREATE INDEX "DepartmentScore_organizationId_idx" ON "DepartmentScore"("organizationId");

-- CreateIndex
CREATE INDEX "DepartmentScore_departmentId_idx" ON "DepartmentScore"("departmentId");

-- AddForeignKey
ALTER TABLE "CarbonTransaction" ADD CONSTRAINT "CarbonTransaction_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarbonTransaction" ADD CONSTRAINT "CarbonTransaction_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarbonTransaction" ADD CONSTRAINT "CarbonTransaction_emissionFactorId_fkey" FOREIGN KEY ("emissionFactorId") REFERENCES "EmissionFactor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarbonTransaction" ADD CONSTRAINT "CarbonTransaction_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CSRActivity" ADD CONSTRAINT "CSRActivity_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CSRActivity" ADD CONSTRAINT "CSRActivity_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CSRActivity" ADD CONSTRAINT "CSRActivity_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeParticipation" ADD CONSTRAINT "EmployeeParticipation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeParticipation" ADD CONSTRAINT "EmployeeParticipation_csrActivityId_fkey" FOREIGN KEY ("csrActivityId") REFERENCES "CSRActivity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeParticipation" ADD CONSTRAINT "EmployeeParticipation_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeParticipation" ADD CONSTRAINT "EmployeeParticipation_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Challenge" ADD CONSTRAINT "Challenge_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Challenge" ADD CONSTRAINT "Challenge_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeParticipation" ADD CONSTRAINT "ChallengeParticipation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeParticipation" ADD CONSTRAINT "ChallengeParticipation_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeParticipation" ADD CONSTRAINT "ChallengeParticipation_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeParticipation" ADD CONSTRAINT "ChallengeParticipation_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyAcknowledgement" ADD CONSTRAINT "PolicyAcknowledgement_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyAcknowledgement" ADD CONSTRAINT "PolicyAcknowledgement_esgPolicyId_fkey" FOREIGN KEY ("esgPolicyId") REFERENCES "ESGPolicy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyAcknowledgement" ADD CONSTRAINT "PolicyAcknowledgement_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceIssue" ADD CONSTRAINT "ComplianceIssue_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceIssue" ADD CONSTRAINT "ComplianceIssue_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceIssue" ADD CONSTRAINT "ComplianceIssue_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepartmentScore" ADD CONSTRAINT "DepartmentScore_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepartmentScore" ADD CONSTRAINT "DepartmentScore_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
