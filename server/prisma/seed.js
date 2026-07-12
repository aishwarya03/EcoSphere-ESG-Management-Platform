import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { createOperationalRecord } from '../src/services/operationalRecordService.js';
import { recomputeDepartmentScores } from '../src/services/departmentScoreService.js';

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'admin@ecosphere.demo';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'Admin@12345';

const EMPLOYEE_EMAIL = 'employee@ecosphere.demo';
const EMPLOYEE_USERNAME = 'employee';
const EMPLOYEE_PASSWORD = 'Employee@12345';

const hashPassword = (plain) => bcrypt.hash(plain, 12);

const ALL_TABLES = [
  'DepartmentScore',
  'ComplianceIssue',
  'Audit',
  'PolicyAcknowledgement',
  'ChallengeParticipation',
  'Challenge',
  'EmployeeParticipation',
  'CSRActivity',
  'OperationalRecord',
  'CarbonTransaction',
  'Reward',
  'Badge',
  'ESGPolicy',
  'EnvironmentalGoal',
  'EmissionFactor',
  'ProductEsgMetric',
  'ProductEsgProfile',
  'Product',
  'ESGConfiguration',
  'Category',
  'Department',
  'User',
  'Organization',
];

const resetDatabase = async () => {
  const quoted = ALL_TABLES.map((t) => `"${t}"`).join(', ');
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${quoted} CASCADE;`);
  console.log('Database wiped.');
};

const main = async () => {
  await resetDatabase();

  // --- Organization + ESG Configuration ---
  const organization = await prisma.organization.create({
    data: { name: 'EcoSphere Demo Corp', type: 'Manufacturing' },
  });

  await prisma.eSGConfiguration.create({
    data: {
      organizationId: organization.id,
      environmentalWeight: 40,
      socialWeight: 30,
      governanceWeight: 30,
      autoEmissionCalculation: true,
      evidenceRequired: true,
      badgeAutoAward: true,
    },
  });

  // --- Departments ---
  const departmentDefs = [
    { name: 'Engineering', code: 'ENG' },
    { name: 'Logistics', code: 'LOG' },
    { name: 'Human Resources', code: 'HR' },
    { name: 'Sales & Marketing', code: 'SALES' },
    { name: 'Sustainability', code: 'SUS' },
  ];
  const departments = {};
  for (const d of departmentDefs) {
    departments[d.code] = await prisma.department.create({
      data: { organizationId: organization.id, name: d.name, code: d.code },
    });
  }

  // --- Users ---
  const admin = await prisma.user.create({
    data: {
      organizationId: organization.id,
      email: ADMIN_EMAIL,
      username: ADMIN_USERNAME,
      passwordHash: await hashPassword(ADMIN_PASSWORD),
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  const employeeDefs = [
    { username: EMPLOYEE_USERNAME, email: EMPLOYEE_EMAIL, dept: 'ENG' },
    { username: 'priya.sharma', email: 'priya.sharma@ecosphere.demo', dept: 'ENG' },
    { username: 'rahul.verma', email: 'rahul.verma@ecosphere.demo', dept: 'LOG' },
    { username: 'ananya.iyer', email: 'ananya.iyer@ecosphere.demo', dept: 'LOG' },
    { username: 'karthik.nair', email: 'karthik.nair@ecosphere.demo', dept: 'HR' },
    { username: 'divya.menon', email: 'divya.menon@ecosphere.demo', dept: 'SALES' },
    { username: 'arjun.singh', email: 'arjun.singh@ecosphere.demo', dept: 'SUS' },
    { username: 'meera.pillai', email: 'meera.pillai@ecosphere.demo', dept: 'SUS' },
  ];
  const employeePasswordHash = await hashPassword(EMPLOYEE_PASSWORD);
  const employees = {};
  for (const e of employeeDefs) {
    employees[e.username] = await prisma.user.create({
      data: {
        organizationId: organization.id,
        email: e.email,
        username: e.username,
        passwordHash: employeePasswordHash,
        role: 'EMPLOYEE',
        status: 'ACTIVE',
        departmentId: departments[e.dept].id,
      },
    });
  }

  await prisma.department.update({
    where: { id: departments.ENG.id },
    data: { headUserId: employees['priya.sharma'].id },
  });
  await prisma.department.update({
    where: { id: departments.SUS.id },
    data: { headUserId: employees['arjun.singh'].id },
  });

  // --- Categories ---
  const categoryDefs = [
    { name: 'Environmental Volunteering', type: 'CSR_ACTIVITY' },
    { name: 'Community Outreach', type: 'CSR_ACTIVITY' },
    { name: 'Green Commute', type: 'CHALLENGE' },
    { name: 'Energy Saving', type: 'CHALLENGE' },
    { name: 'Electronics', type: 'PRODUCT' },
    { name: 'Packaging', type: 'PRODUCT' },
  ];
  const categories = {};
  for (const c of categoryDefs) {
    categories[c.name] = await prisma.category.create({ data: { organizationId: organization.id, ...c } });
  }

  // --- Products + ESG Profiles + Metrics ---
  const bottle = await prisma.product.create({
    data: {
      organizationId: organization.id,
      name: 'EcoBottle 750ml',
      code: 'BOT-750',
      type: 'PHYSICAL_GOOD',
      categoryId: categories.Packaging.id,
      description: 'Reusable water bottle made from recycled materials.',
    },
  });
  await prisma.productEsgProfile.create({
    data: {
      productId: bottle.id,
      version: 1,
      carbonFootprintKgCo2e: 2.4,
      overallScore: 62,
      status: 'DRAFT',
      notes: 'Initial assessment before supplier change.',
      metrics: {
        create: [
          { pillar: 'ENVIRONMENTAL', name: 'Recycled Material', value: '40', unit: '%' },
          { pillar: 'SOCIAL', name: 'Fair Trade Certified', value: 'No' },
          { pillar: 'GOVERNANCE', name: 'ISO 9001', value: 'No' },
        ],
      },
    },
  });
  await prisma.productEsgProfile.create({
    data: {
      productId: bottle.id,
      version: 2,
      carbonFootprintKgCo2e: 1.8,
      overallScore: 84,
      status: 'PUBLISHED',
      notes: 'Improved after switching to a certified recycled-material supplier.',
      metrics: {
        create: [
          { pillar: 'ENVIRONMENTAL', name: 'Recycled Material', value: '80', unit: '%' },
          { pillar: 'ENVIRONMENTAL', name: 'Water Usage', value: '12', unit: 'L' },
          { pillar: 'SOCIAL', name: 'Fair Trade Certified', value: 'Yes' },
          { pillar: 'GOVERNANCE', name: 'ISO 9001', value: 'Yes' },
        ],
      },
    },
  });

  const meter = await prisma.product.create({
    data: {
      organizationId: organization.id,
      name: 'SmartMeter X1',
      code: 'MTR-X1',
      type: 'PHYSICAL_GOOD',
      categoryId: categories.Electronics.id,
      description: 'IoT-enabled energy monitoring device.',
    },
  });
  await prisma.productEsgProfile.create({
    data: {
      productId: meter.id,
      version: 1,
      carbonFootprintKgCo2e: 5.2,
      overallScore: 71,
      status: 'PUBLISHED',
      metrics: {
        create: [
          { pillar: 'ENVIRONMENTAL', name: 'Recyclability', value: '65', unit: '%' },
          { pillar: 'SOCIAL', name: 'Worker Safety Audited', value: 'Yes' },
          { pillar: 'GOVERNANCE', name: 'RoHS Compliant', value: 'Yes' },
        ],
      },
    },
  });

  const saas = await prisma.product.create({
    data: {
      organizationId: organization.id,
      name: 'Cloud Analytics Suite',
      code: 'SAAS-01',
      type: 'SERVICE',
      categoryId: categories.Electronics.id,
      description: 'Data analytics platform for sustainability reporting.',
    },
  });
  await prisma.productEsgProfile.create({
    data: {
      productId: saas.id,
      version: 1,
      carbonFootprintKgCo2e: 0.6,
      overallScore: 88,
      status: 'PUBLISHED',
      metrics: {
        create: [
          { pillar: 'ENVIRONMENTAL', name: 'Data Center Energy Rating', value: 'A++' },
          { pillar: 'SOCIAL', name: 'Accessibility Certified', value: 'Yes' },
          { pillar: 'GOVERNANCE', name: 'ISO 27001', value: 'Yes' },
        ],
      },
    },
  });

  // --- Emission Factors ---
  const factorDefs = [
    { name: 'Diesel (Fleet)', sourceType: 'FLEET', unit: 'liter', co2ePerUnit: 2.68, source: 'DEFRA 2024' },
    { name: 'Petrol (Fleet)', sourceType: 'FLEET', unit: 'liter', co2ePerUnit: 2.31, source: 'DEFRA 2024' },
    { name: 'Grid Electricity - IN', sourceType: 'ELECTRICITY', unit: 'kWh', co2ePerUnit: 0.82, source: 'CEA 2024' },
    { name: 'Business Air Travel', sourceType: 'EXPENSE', unit: 'km', co2ePerUnit: 0.15, source: 'DEFRA 2024' },
    { name: 'Office Paper (Recycled)', sourceType: 'PURCHASE', unit: 'kg', co2ePerUnit: 0.9, source: 'EPA' },
    { name: 'Steel Production', sourceType: 'MANUFACTURING', unit: 'kg', co2ePerUnit: 1.85, source: 'IPCC' },
  ];
  const factors = {};
  for (const f of factorDefs) {
    factors[f.name] = await prisma.emissionFactor.create({
      data: { organizationId: organization.id, validFrom: new Date('2024-01-01'), ...f },
    });
  }

  // --- Environmental Goals ---
  await prisma.environmentalGoal.create({
    data: {
      organizationId: organization.id,
      title: 'Reduce Total Carbon Emissions',
      targetMetric: 'Carbon Emissions',
      baselineValue: 5000,
      targetValue: 3500,
      unit: 'kg CO2e',
      startDate: new Date('2026-01-01'),
      targetDate: new Date('2026-12-31'),
      status: 'ACTIVE',
    },
  });
  await prisma.environmentalGoal.create({
    data: {
      organizationId: organization.id,
      departmentId: departments.LOG.id,
      title: 'Reduce Fleet Emissions',
      targetMetric: 'Carbon Emissions',
      baselineValue: 2000,
      targetValue: 1200,
      unit: 'kg CO2e',
      startDate: new Date('2026-01-01'),
      targetDate: new Date('2026-12-31'),
      status: 'ACTIVE',
    },
  });

  // --- ESG Policies ---
  const policyDefs = [
    { title: 'Code of Conduct', category: 'Governance', effectiveDate: new Date('2026-01-01'), status: 'PUBLISHED' },
    { title: 'Data Privacy Policy', category: 'Governance', effectiveDate: new Date('2026-01-01'), status: 'PUBLISHED' },
    { title: 'Anti-Corruption Policy', category: 'Governance', effectiveDate: new Date('2026-02-01'), status: 'PUBLISHED' },
    { title: 'Remote Work Policy', category: 'HR', effectiveDate: new Date('2026-08-01'), status: 'DRAFT' },
  ];
  const policies = {};
  for (const p of policyDefs) {
    policies[p.title] = await prisma.eSGPolicy.create({ data: { organizationId: organization.id, ...p } });
  }

  // --- Badges ---
  const badgeDefs = [
    { name: 'First Steps', description: 'Complete your first CSR activity', unlockMetric: 'CSR_PARTICIPATIONS_COMPLETED', unlockThreshold: 1, icon: '🌱' },
    { name: 'Green Champion', description: 'Complete 3 challenges', unlockMetric: 'CHALLENGES_COMPLETED', unlockThreshold: 3, icon: '🏆' },
    { name: 'XP Master', description: 'Earn 500 XP', unlockMetric: 'XP_TOTAL', unlockThreshold: 500, icon: '⭐' },
    { name: 'Sustainability Hero', description: 'Earn 1000 XP', unlockMetric: 'XP_TOTAL', unlockThreshold: 1000, icon: '🌍' },
  ];
  for (const b of badgeDefs) {
    await prisma.badge.create({ data: { organizationId: organization.id, ...b } });
  }

  // --- Rewards ---
  const rewardDefs = [
    { name: 'Coffee Voucher', description: 'Free coffee at the office cafe', pointsRequired: 100, stock: 50 },
    { name: 'Company Merchandise', description: 'EcoSphere branded merchandise', pointsRequired: 250, stock: 20 },
    { name: 'Extra Day Off', description: 'One additional paid day off', pointsRequired: 500, stock: 10 },
    { name: 'Wellness Package', description: 'Spa & wellness voucher', pointsRequired: 750, stock: 5 },
  ];
  for (const r of rewardDefs) {
    await prisma.reward.create({ data: { organizationId: organization.id, ...r } });
  }

  // --- CSR Activities ---
  const csrActivityDefs = [
    { title: 'Tree Planting Drive', pointsValue: 50, categoryId: categories['Environmental Volunteering'].id, startDate: new Date('2026-06-01') },
    { title: 'Beach Cleanup', pointsValue: 40, categoryId: categories['Environmental Volunteering'].id, startDate: new Date('2026-06-15') },
    { title: 'Blood Donation Camp', pointsValue: 30, categoryId: categories['Community Outreach'].id, startDate: new Date('2026-07-01') },
  ];
  const csrActivities = {};
  for (const a of csrActivityDefs) {
    csrActivities[a.title] = await prisma.cSRActivity.create({ data: { organizationId: organization.id, ...a } });
  }

  // --- Employee Participations (CSR) ---
  const csrParticipationDefs = [
    { user: EMPLOYEE_USERNAME, activity: 'Tree Planting Drive', status: 'APPROVED', points: 50, proof: 'https://photos.example.com/tree-1.jpg' },
    { user: 'priya.sharma', activity: 'Beach Cleanup', status: 'APPROVED', points: 40, proof: 'https://photos.example.com/beach-1.jpg' },
    { user: 'rahul.verma', activity: 'Tree Planting Drive', status: 'APPROVED', points: 50, proof: 'https://photos.example.com/tree-2.jpg' },
    { user: 'ananya.iyer', activity: 'Blood Donation Camp', status: 'PENDING', points: null, proof: 'https://photos.example.com/blood-1.jpg' },
    { user: 'karthik.nair', activity: 'Beach Cleanup', status: 'APPROVED', points: 40, proof: 'https://photos.example.com/beach-2.jpg' },
    { user: 'divya.menon', activity: 'Blood Donation Camp', status: 'REJECTED', points: null, proof: null },
    { user: 'arjun.singh', activity: 'Tree Planting Drive', status: 'APPROVED', points: 50, proof: 'https://photos.example.com/tree-3.jpg' },
    { user: 'meera.pillai', activity: 'Beach Cleanup', status: 'APPROVED', points: 40, proof: 'https://photos.example.com/beach-3.jpg' },
  ];
  for (const p of csrParticipationDefs) {
    const isReviewed = p.status !== 'PENDING';
    await prisma.employeeParticipation.create({
      data: {
        organizationId: organization.id,
        csrActivityId: csrActivities[p.activity].id,
        employeeId: employees[p.user].id,
        proof: p.proof,
        approvalStatus: p.status,
        pointsEarned: p.points,
        completionDate: new Date('2026-06-20'),
        reviewedAt: isReviewed ? new Date('2026-06-22') : null,
        reviewedByUserId: isReviewed ? admin.id : null,
      },
    });
  }

  // --- Challenges ---
  const challengeDefs = [
    { title: 'Bike to Work Week', xp: 100, difficulty: 'MEDIUM', deadline: new Date('2026-08-01'), status: 'ACTIVE', categoryId: categories['Green Commute'].id },
    { title: 'Zero Waste Challenge', xp: 150, difficulty: 'HARD', evidenceRequired: true, deadline: new Date('2026-08-15'), status: 'ACTIVE', categoryId: categories['Green Commute'].id },
    { title: 'Energy Saving Sprint', xp: 80, difficulty: 'EASY', deadline: new Date('2026-06-30'), status: 'COMPLETED', categoryId: categories['Energy Saving'].id },
  ];
  const challenges = {};
  for (const c of challengeDefs) {
    challenges[c.title] = await prisma.challenge.create({ data: { organizationId: organization.id, ...c } });
  }

  // --- Challenge Participations ---
  const challengeParticipationDefs = [
    { user: EMPLOYEE_USERNAME, challenge: 'Bike to Work Week', progress: 100, status: 'APPROVED', xp: 100, proof: 'Logged 5 bike commutes' },
    { user: 'priya.sharma', challenge: 'Zero Waste Challenge', progress: 60, status: 'PENDING', xp: null, proof: 'https://photos.example.com/zero-waste-1.jpg' },
    { user: 'rahul.verma', challenge: 'Bike to Work Week', progress: 100, status: 'APPROVED', xp: 110, proof: 'Logged 6 bike commutes, extra credit' },
    { user: 'karthik.nair', challenge: 'Energy Saving Sprint', progress: 100, status: 'APPROVED', xp: 80, proof: 'Reduced desk energy usage by 20%' },
    { user: 'arjun.singh', challenge: 'Bike to Work Week', progress: 100, status: 'APPROVED', xp: 100, proof: 'Logged 5 bike commutes' },
    { user: 'meera.pillai', challenge: 'Zero Waste Challenge', progress: 40, status: 'REJECTED', xp: null, proof: 'https://photos.example.com/zero-waste-2.jpg' },
  ];
  for (const cp of challengeParticipationDefs) {
    const isReviewed = cp.status !== 'PENDING';
    await prisma.challengeParticipation.create({
      data: {
        organizationId: organization.id,
        challengeId: challenges[cp.challenge].id,
        employeeId: employees[cp.user].id,
        progress: cp.progress,
        proof: cp.proof,
        approvalStatus: cp.status,
        xpAwarded: cp.xp,
        reviewedAt: isReviewed ? new Date('2026-07-05') : null,
        reviewedByUserId: isReviewed ? admin.id : null,
      },
    });
  }

  // --- Policy Acknowledgements ---
  const publishedPolicies = ['Code of Conduct', 'Data Privacy Policy', 'Anti-Corruption Policy'];
  const ackPlan = {
    [EMPLOYEE_USERNAME]: publishedPolicies,
    'priya.sharma': publishedPolicies,
    'rahul.verma': publishedPolicies,
    'ananya.iyer': ['Code of Conduct', 'Data Privacy Policy'],
    'karthik.nair': publishedPolicies,
    'divya.menon': ['Code of Conduct'],
    'arjun.singh': publishedPolicies,
    'meera.pillai': publishedPolicies,
  };
  for (const [username, ackedPolicies] of Object.entries(ackPlan)) {
    for (const policyTitle of ackedPolicies) {
      const policy = policies[policyTitle];
      await prisma.policyAcknowledgement.create({
        data: {
          organizationId: organization.id,
          esgPolicyId: policy.id,
          employeeId: employees[username].id,
          policyVersion: policy.version,
          acknowledgedAt: new Date('2026-06-10'),
        },
      });
    }
  }

  // --- Operational Records (auto-processed via real service logic) ---
  const operationalRecordDefs = [
    { dept: 'LOG', sourceType: 'FLEET', description: 'Delivery fleet diesel refill', quantity: 300, unit: 'liter', recordDate: new Date('2026-06-20') },
    { dept: 'LOG', sourceType: 'FLEET', description: 'Delivery fleet petrol refill', quantity: 100, unit: 'liter', recordDate: new Date('2026-06-25') },
    { dept: 'LOG', sourceType: 'ELECTRICITY', description: 'Warehouse electricity usage', quantity: 500, unit: 'kWh', recordDate: new Date('2026-06-28') },
    { dept: 'ENG', sourceType: 'MANUFACTURING', description: 'Steel batch for product housings', quantity: 200, unit: 'kg', recordDate: new Date('2026-06-10') },
    { dept: 'ENG', sourceType: 'PURCHASE', description: 'Office paper stock replenishment', quantity: 150, unit: 'kg', recordDate: new Date('2026-06-12') },
    { dept: 'SUS', sourceType: 'PURCHASE', description: 'Office paper stock replenishment', quantity: 50, unit: 'kg', recordDate: new Date('2026-06-15') },
    { dept: 'SALES', sourceType: 'OTHER', description: 'Miscellaneous unclassified expense (no factor configured)', quantity: 10, unit: 'unit', recordDate: new Date('2026-07-01') },
  ];
  for (const r of operationalRecordDefs) {
    await createOperationalRecord({
      organizationId: organization.id,
      createdByUserId: admin.id,
      departmentId: departments[r.dept].id,
      sourceType: r.sourceType,
      description: r.description,
      quantity: r.quantity,
      unit: r.unit,
      recordDate: r.recordDate,
    });
  }

  // --- A manual Carbon Transaction (not via an operational record) ---
  await prisma.carbonTransaction.create({
    data: {
      organizationId: organization.id,
      departmentId: departments.SALES.id,
      emissionFactorId: factors['Business Air Travel'].id,
      quantity: 500,
      calculatedEmissionsKgCo2e: 500 * factors['Business Air Travel'].co2ePerUnit,
      transactionDate: new Date('2026-06-20'),
      notes: 'Client visit business travel',
      createdByUserId: admin.id,
    },
  });

  // --- Audits + Compliance Issues ---
  const auditFleet = await prisma.audit.create({
    data: {
      organizationId: organization.id,
      title: 'Q1 Fleet Audit',
      departmentId: departments.LOG.id,
      auditor: 'Internal Audit Team',
      auditDate: new Date('2026-03-31'),
      status: 'COMPLETED',
      findingsSummary: 'Minor documentation gaps found in fuel receipts.',
    },
  });
  const auditGovernance = await prisma.audit.create({
    data: {
      organizationId: organization.id,
      title: 'Annual Governance Audit',
      auditor: 'External Auditors LLP',
      auditDate: new Date('2026-05-15'),
      status: 'COMPLETED',
      findingsSummary: 'Overall governance controls found satisfactory.',
    },
  });
  await prisma.audit.create({
    data: {
      organizationId: organization.id,
      title: 'Q3 Workplace Safety Audit',
      departmentId: departments.ENG.id,
      auditor: 'Internal Audit Team',
      auditDate: new Date('2026-09-01'),
      status: 'PLANNED',
    },
  });

  const complianceIssueDefs = [
    { audit: auditFleet, severity: 'HIGH', description: 'Missing fuel receipts for March', owner: 'rahul.verma', dueDate: new Date('2026-07-01'), status: 'OPEN' },
    { audit: auditFleet, severity: 'LOW', description: 'Vehicle inspection log incomplete', owner: 'ananya.iyer', dueDate: new Date('2026-08-01'), status: 'IN_PROGRESS' },
    { audit: auditGovernance, severity: 'MEDIUM', description: 'Board meeting minutes not archived on time', owner: ADMIN_USERNAME, dueDate: new Date('2026-06-01'), status: 'RESOLVED' },
    { audit: auditGovernance, severity: 'CRITICAL', description: 'Data retention policy violation identified', owner: 'karthik.nair', dueDate: new Date('2026-06-15'), status: 'CLOSED' },
  ];
  for (const ci of complianceIssueDefs) {
    const ownerId = ci.owner === ADMIN_USERNAME ? admin.id : employees[ci.owner].id;
    await prisma.complianceIssue.create({
      data: {
        organizationId: organization.id,
        auditId: ci.audit.id,
        severity: ci.severity,
        description: ci.description,
        ownerId,
        dueDate: ci.dueDate,
        status: ci.status,
      },
    });
  }

  // --- Department Scores (computed via the real scoring engine) ---
  await recomputeDepartmentScores(organization.id);

  console.log('\nDemo data seeded successfully.\n');
  console.log('Admin login:');
  console.log(`  username: ${ADMIN_USERNAME}  (or email: ${ADMIN_EMAIL})`);
  console.log(`  password: ${ADMIN_PASSWORD}`);
  console.log('\nEmployee login:');
  console.log(`  username: ${EMPLOYEE_USERNAME}  (or email: ${EMPLOYEE_EMAIL})`);
  console.log(`  password: ${EMPLOYEE_PASSWORD}`);
};

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
