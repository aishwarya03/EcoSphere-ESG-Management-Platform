import prisma from '../prisma/client.js';
import AppError from '../utils/AppError.js';

const assertDepartmentInOrg = async (organizationId, departmentId) => {
  const department = await prisma.department.findFirst({ where: { id: departmentId, organizationId } });
  if (!department) {
    throw new AppError('departmentId does not reference a department in this organization', 422);
  }
};

const getActiveEmissionFactor = async (organizationId, emissionFactorId) => {
  const factor = await prisma.emissionFactor.findFirst({
    where: { id: emissionFactorId, organizationId },
  });
  if (!factor) {
    throw new AppError('emissionFactorId does not reference an emission factor in this organization', 422);
  }
  if (factor.status !== 'ACTIVE') {
    throw new AppError('This emission factor is inactive and cannot be used for new transactions', 422);
  }
  return factor;
};

export const createCarbonTransaction = async ({
  organizationId,
  createdByUserId,
  departmentId,
  emissionFactorId,
  quantity,
  transactionDate,
  notes,
}) => {
  if (departmentId) await assertDepartmentInOrg(organizationId, departmentId);
  const factor = await getActiveEmissionFactor(organizationId, emissionFactorId);

  return prisma.carbonTransaction.create({
    data: {
      organizationId,
      createdByUserId: createdByUserId ?? null,
      departmentId: departmentId ?? null,
      emissionFactorId,
      quantity,
      calculatedEmissionsKgCo2e: quantity * factor.co2ePerUnit,
      transactionDate,
      notes: notes ?? null,
    },
    include: { department: true, emissionFactor: true },
  });
};

export const listCarbonTransactions = async (organizationId, filters = {}) => {
  return prisma.carbonTransaction.findMany({
    where: {
      organizationId,
      ...(filters.departmentId ? { departmentId: filters.departmentId } : {}),
      ...(filters.emissionFactorId ? { emissionFactorId: filters.emissionFactorId } : {}),
      ...(filters.dateFrom || filters.dateTo
        ? {
            transactionDate: {
              ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
              ...(filters.dateTo ? { lte: filters.dateTo } : {}),
            },
          }
        : {}),
    },
    include: { department: true, emissionFactor: true },
    orderBy: { transactionDate: 'desc' },
  });
};

export const getCarbonTransaction = async (organizationId, id) => {
  const transaction = await prisma.carbonTransaction.findFirst({
    where: { id, organizationId },
    include: { department: true, emissionFactor: true },
  });
  if (!transaction) {
    throw new AppError('Carbon transaction not found', 404);
  }
  return transaction;
};

export const updateCarbonTransaction = async (organizationId, id, data) => {
  const transaction = await prisma.carbonTransaction.findFirst({ where: { id, organizationId } });
  if (!transaction) {
    throw new AppError('Carbon transaction not found', 404);
  }

  if (data.departmentId) await assertDepartmentInOrg(organizationId, data.departmentId);

  let calculatedEmissionsKgCo2e;
  if (data.quantity !== undefined || data.emissionFactorId !== undefined) {
    const factor = await getActiveEmissionFactor(
      organizationId,
      data.emissionFactorId ?? transaction.emissionFactorId
    );
    const quantity = data.quantity ?? transaction.quantity;
    calculatedEmissionsKgCo2e = quantity * factor.co2ePerUnit;
  }

  return prisma.carbonTransaction.update({
    where: { id },
    data: {
      ...data,
      ...(calculatedEmissionsKgCo2e !== undefined ? { calculatedEmissionsKgCo2e } : {}),
    },
    include: { department: true, emissionFactor: true },
  });
};

export const getEmissionsSummaryByDepartment = async (organizationId) => {
  const departments = await prisma.department.findMany({
    where: { organizationId },
    select: { id: true, name: true, code: true },
  });

  const totals = await prisma.carbonTransaction.groupBy({
    by: ['departmentId'],
    where: { organizationId },
    _sum: { calculatedEmissionsKgCo2e: true },
  });
  const totalsByDept = new Map(totals.map((t) => [t.departmentId, t._sum.calculatedEmissionsKgCo2e ?? 0]));

  return departments.map((dept) => ({
    departmentId: dept.id,
    departmentName: dept.name,
    departmentCode: dept.code,
    totalEmissionsKgCo2e: totalsByDept.get(dept.id) ?? 0,
  }));
};
