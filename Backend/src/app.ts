import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json';

import { env } from './config/env.config';
import { requestIdMiddleware } from './middlewares/requestId.middleware';
import { errorMiddleware } from './middlewares/error.middleware';
import { notFoundMiddleware } from './middlewares/404.middleware';
import { sendSuccess } from './utils/response';

// Routes
import healthRoutes from './routes/health.route';
import authRoutes from './routes/auth.route';
import userRoutes from './routes/user.route';
import eventRoutes from './routes/event.route';
import ticketRoutes from './routes/ticket.route';
import checkInRoutes from './routes/checkin.route';
import organizerRoutes from './routes/organizer.route';
import adminRoutes from './routes/admin.route';

const app = express();

// Security Headers
app.use(helmet());
app.use(mongoSanitize());
app.use(hpp());
app.disable('x-powered-by');

// CORS
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Logging
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
// app.use(mongoSanitize());

// Prevent parameter pollution
// app.use(hpp());

// Compression
app.use(compression());

// Request ID Injection
app.use(requestIdMiddleware);

// Root Health Check (Required by some cloud providers at /)
app.get('/health', (req, res) => {
  sendSuccess(req as any, res, 200, 'Root Health check passed', {
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/check-in', checkInRoutes);
app.use('/api/v1/organizer', organizerRoutes);
app.use('/api/v1/admin', adminRoutes);

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Handle undefined routes
app.use(notFoundMiddleware);

// Global Error Handler
app.use(errorMiddleware);

export default app;
