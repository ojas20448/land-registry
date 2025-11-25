import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import multer from 'multer';

// Load environment variables
dotenv.config();

// Import routes
import { parcelRoutes } from './routes/parcel.routes';
import { disputeRoutes } from './routes/dispute.routes';
import { mortgageRoutes } from './routes/mortgage.routes';
import { publicRoutes } from './routes/public.routes';

// Import services
import { fabricGateway } from './services/fabric-gateway.service';

/**
 * Express Application Setup
 */
class App {
  public app: Application;
  
  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Initialize middlewares
   */
  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());

    // CORS
    const corsOptions = {
      origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
      credentials: true,
    };
    this.app.use(cors(corsOptions));

    // Body parser
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use(morgan('combined'));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
      message: 'Too many requests from this IP, please try again later.',
    });
    this.app.use('/api/', limiter);

    // File upload configuration
    const upload = multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE_MB || '10') * 1024 * 1024,
      },
    });
    this.app.set('upload', upload);
  }

  /**
   * Initialize routes
   */
  private initializeRoutes(): void {
    // Health check
    this.app.get('/health', (req: Request, res: Response) => {
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'Land Registry API',
      });
    });

    // API routes
    this.app.use('/api/v1/parcels', parcelRoutes);
    this.app.use('/api/v1/disputes', disputeRoutes);
    this.app.use('/api/v1/bank', mortgageRoutes);
    this.app.use('/api/v1/public', publicRoutes);

    // API documentation
    this.app.get('/api-docs', (req: Request, res: Response) => {
      res.status(200).json({
        message: 'Land Registry API Documentation',
        version: '1.0.0',
        endpoints: {
          parcels: '/api/v1/parcels',
          disputes: '/api/v1/disputes',
          bank: '/api/v1/bank',
          public: '/api/v1/public',
        },
      });
    });

    // 404 handler
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        error: 'Route not found',
      });
    });
  }

  /**
   * Initialize error handling
   */
  private initializeErrorHandling(): void {
    this.app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      console.error('Error:', err);
      
      res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
      });
    });
  }

  /**
   * Start the server
   */
  public async listen(): Promise<void> {
    const PORT = process.env.PORT || 4000;
    const HOST = process.env.HOST || '0.0.0.0';

    try {
      // Connect to Fabric Gateway
      console.log('🔗 Connecting to Hyperledger Fabric...');
      await fabricGateway.connect();

      // Start Express server
      this.app.listen(PORT, () => {
        console.log(`🚀 Land Registry API Server running on ${HOST}:${PORT}`);
        console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`📡 Health check: http://${HOST}:${PORT}/health`);
        console.log(`📖 API docs: http://${HOST}:${PORT}/api-docs`);
      });
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Create and start the application
const application = new App();
application.listen();

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await fabricGateway.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await fabricGateway.disconnect();
  process.exit(0);
});

export default application.app;
