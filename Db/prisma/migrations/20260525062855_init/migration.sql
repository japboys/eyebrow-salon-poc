-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "visitCount" INTEGER NOT NULL DEFAULT 0,
    "lastVisitDate" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CustomerProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "defaultDesign" TEXT,
    "preferredThickness" INTEGER NOT NULL DEFAULT 0,
    "preferredAngle" INTEGER NOT NULL DEFAULT 0,
    "preferredDensity" INTEGER NOT NULL DEFAULT 0,
    "asymmetryType" TEXT,
    "asymmetryLevel" INTEGER NOT NULL DEFAULT 0,
    "hairFlowNotes" TEXT,
    "sparseAreaNotes" TEXT,
    "skinRiskProfile" TEXT,
    "ngPoints" TEXT,
    "selfCareHabitNotes" TEXT,
    "generalHandoverNotes" TEXT,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CustomerProfile_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VisitRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "visitDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visitType" TEXT NOT NULL DEFAULT 'repeat_visit',
    "previousRecordId" TEXT,
    "visitPolicy" TEXT NOT NULL DEFAULT 'same_as_previous',
    "changedFields" TEXT,
    "designPlan" TEXT,
    "todayObservation" TEXT,
    "treatmentRecord" TEXT,
    "reaction" TEXT,
    "handover" TEXT,
    "aiPlaceholder" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VisitRecord_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomerProfile_customerId_key" ON "CustomerProfile"("customerId");
