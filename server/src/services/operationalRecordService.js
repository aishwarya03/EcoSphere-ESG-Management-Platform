import prisma from '../prisma/client.js';
import AppError from '../utils/AppError.js';

const INCLUDE = {
  department: { select: { id: true, name: true, code: true } },
  carbonTransaction: true,
};

const assertDepartmentInOrg = async (organizationId, departmentId) => {
  const department = await prisma.department.findFirst({ where: { id: departmentId, organizationId } });
  if (!department) {
    throw new AppError('departmentId does not reference a department in this organization', 422);
  }
};

const findMatchingFactor = async (organizationId, sourceType, unit, recordDate) => {
  return prisma.emissionFactor.findFirst({
    where: {
      organizationId,
      sourceType,
      unit,
      status: 'ACTIVE',
      AND: [
        { OR: [{ validFrom: null }, { validFrom: { lte: recordDate } }] },
        { OR: [{ validTo: null }, { validTo: { gte: recordDate } }] },
      ],
    },
    orderBy: { createdAt: 'desc' },
  });
};

const attemptAutoProcess = async (organizationId, record, createdByUserId) => {
  const factor = await findMatchingFactor(organizationId, record.sourceType, record.unit, record.recordDate);
  if (!factor) return record;

  const transaction = await prisma.carbonTransaction.create({
    data: {
      organizationId,
      departmentId: record.departmentId,
      emissionFactorId: factor.id,
      quantity: record.quantity,
      calculatedEmissionsKgCo2e: record.quantity * factor.co2ePerUnit,
      transactionDate: record.recordDate,
      notes: `Auto-generated from operational record (${record.sourceType})`,
      createdByUserId: createdByUserId ?? null,
    },
  });

  return prisma.operationalRecord.update({
    where: { id: record.id },
    data: { processed: true, carbonTransactionId: transaction.id },
    include: INCLUDE,
  });
};

export const createOperationalRecord = async ({
  organizationId,
  createdByUserId,
  departmentId,
  sourceType,
  description,
  quantity,
  unit,
  recordDate,
}) => {
  if (departmentId) await assertDepartmentInOrg(organizationId, departmentId);

  let record = await prisma.operationalRecord.create({
    data: {
      organizationId,
      departmentId: departmentId ?? null,
      sourceType,
      description: description ?? null,
      quantity,
      unit,
      recordDate,
    },
    include: INCLUDE,
  });

  const esgConfig = await prisma.eSGConfiguration.findUnique({ where: { organizationId } });
  if (esgConfig?.autoEmissionCalculation) {
    record = await attemptAutoProcess(organizationId, record, createdByUserId);
  }

  return record;
};

export const listOperationalRecords = async (organizationId, filters = {}) => {
  return prisma.operationalRecord.findMany({
    where: {
      organizationId,
      ...(filters.sourceType ? { sourceType: filters.sourceType } : {}),
      ...(filters.departmentId ? { departmentId: filters.departmentId } : {}),
      ...(filters.processed !== undefined ? { processed: filters.processed } : {}),
    },
    include: INCLUDE,
    orderBy: { recordDate: 'desc' },
  });
};

export const getOperationalRecord = async (organizationId, id) => {
  const record = await prisma.operationalRecord.findFirst({
    where: { id, organizationId },
    include: INCLUDE,
  });
  if (!record) {
    throw new AppError('Operational record not found', 404);
  }
  return record;
};

export const processPendingRecords = async (organizationId, createdByUserId) => {
  const pending = await prisma.operationalRecord.findMany({
    where: { organizationId, processed: false },
  });

  let processedCount = 0;
  for (const record of pending) {
    const updated = await attemptAutoProcess(organizationId, record, createdByUserId);
    if (updated.processed) processedCount += 1;
  }

  return {
    attempted: pending.length,
    processed: processedCount,
    stillUnprocessed: pending.length - processedCount,
  };
};

const DEMO_FACTORS = [
  { sourceType: 'PURCHASE', name: 'Office Paper (Recycled) - Demo', unit: 'kg', co2ePerUnit: 0.9, source: 'Demo Data' },
  { sourceType: 'MANUFACTURING', name: 'Steel Production - Demo', unit: 'kg', co2ePerUnit: 1.85, source: 'Demo Data' },
  { sourceType: 'EXPENSE', name: 'Business Air Travel - Demo', unit: 'km', co2ePerUnit: 0.15, source: 'Demo Data' },
  { sourceType: 'FLEET', name: 'Diesel (Fleet) - Demo', unit: 'liter', co2ePerUnit: 2.68, source: 'Demo Data' },
];

const DEMO_RECORDS = [
  { sourceType: 'PURCHASE', description: 'Office paper stock replenishment', quantity: 200, unit: 'kg', daysAgo: 20 },
  { sourceType: 'MANUFACTURING', description: 'Steel batch for product housings', quantity: 500, unit: 'kg', daysAgo: 15 },
  { sourceType: 'EXPENSE', description: 'Sales team business travel', quantity: 1200, unit: 'km', daysAgo: 10 },
  { sourceType: 'FLEET', description: 'Delivery fleet diesel refill', quantity: 300, unit: 'liter', daysAgo: 5 },
  { sourceType: 'ELECTRICITY', description: 'Warehouse electricity usage (no factor configured yet)', quantity: 800, unit: 'kWh', daysAgo: 3 },
];

export const seedDemoData = async (organizationId, createdByUserId) => {
  for (const factor of DEMO_FACTORS) {
    const existing = await prisma.emissionFactor.findFirst({
      where: { organizationId, sourceType: factor.sourceType, unit: factor.unit, status: 'ACTIVE' },
    });
    if (!existing) {
      await prisma.emissionFactor.create({ data: { organizationId, ...factor } });
    }
  }

  const department = await prisma.department.findFirst({ where: { organizationId } });

  const created = [];
  for (const demo of DEMO_RECORDS) {
    const recordDate = new Date(Date.now() - demo.daysAgo * 24 * 60 * 60 * 1000);
    const record = await createOperationalRecord({
      organizationId,
      createdByUserId,
      departmentId: department?.id ?? null,
      sourceType: demo.sourceType,
      description: demo.description,
      quantity: demo.quantity,
      unit: demo.unit,
      recordDate,
    });
    created.push(record);
  }

  return created;
};
