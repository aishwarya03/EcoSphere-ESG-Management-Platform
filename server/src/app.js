import express from 'express';
import cors from 'cors';

import healthRoutes from './routes/healthRoutes.js';
import pingRoutes from './routes/pingRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import esgConfigRoutes from './routes/esgConfigRoutes.js';

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

// 404 Handler
app.use(notFound);

// Global Error Handler
app.use(errorHandler);

export default app;