import express from 'express';
import cors from 'cors';

import healthRoutes from './routes/healthRoutes.js';
import pingRoutes from './routes/pingRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import esgConfigRoutes from './routes/esgConfigRoutes.js';
import organizationRoutes from './routes/organizationRoutes.js';
import productRoutes from './routes/productRoutes.js';
import emissionFactorRoutes from './routes/emissionFactorRoutes.js';
import environmentalGoalRoutes from './routes/environmentalGoalRoutes.js';
import esgPolicyRoutes from './routes/esgPolicyRoutes.js';
import badgeRoutes from './routes/badgeRoutes.js';
import rewardRoutes from './routes/rewardRoutes.js';
import carbonTransactionRoutes from './routes/carbonTransactionRoutes.js';
import csrActivityRoutes from './routes/csrActivityRoutes.js';
import employeeParticipationRoutes from './routes/employeeParticipationRoutes.js';
import challengeRoutes from './routes/challengeRoutes.js';
import challengeParticipationRoutes from './routes/challengeParticipationRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import complianceIssueRoutes from './routes/complianceIssueRoutes.js';
import departmentScoreRoutes from './routes/departmentScoreRoutes.js';

import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// Built-in Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use(healthRoutes);
app.use(pingRoutes);
app.use(authRoutes);
app.use(userRoutes);
app.use(departmentRoutes);
app.use(categoryRoutes);
app.use(esgConfigRoutes);
app.use(organizationRoutes);
app.use(productRoutes);
app.use(emissionFactorRoutes);
app.use(environmentalGoalRoutes);
app.use(esgPolicyRoutes);
app.use(badgeRoutes);
app.use(rewardRoutes);
app.use(carbonTransactionRoutes);
app.use(csrActivityRoutes);
app.use(employeeParticipationRoutes);
app.use(challengeRoutes);
app.use(challengeParticipationRoutes);
app.use(auditRoutes);
app.use(complianceIssueRoutes);
app.use(departmentScoreRoutes);

// 404 Handler
app.use(notFound);

// Global Error Handler
app.use(errorHandler);

export default app;