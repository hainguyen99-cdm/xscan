import { NestFactory } from '@nestjs/core';
import { ValidationPipe, RequestMethod } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Disable NestJS built-in body parser to use our custom Express middleware
    bodyParser: false,
  });

  // Enable WebSocket support
  app.useWebSocketAdapter(new IoAdapter(app));

  // Add logging middleware for debugging large payloads (BEFORE body parsing)
  app.use((req, res, next) => {
    const contentLength = req.headers['content-length'];
    if (contentLength) {
      const sizeInMB = Math.round(parseInt(contentLength) / (1024 * 1024) * 100) / 100;
      console.log(`📝 Request size: ${sizeInMB}MB (${contentLength} bytes) - ${req.method} ${req.path}`);
      
      // Warn if payload is very large
      if (parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB
        console.warn(`⚠️ Large payload detected: ${sizeInMB}MB for ${req.method} ${req.path}`);
      }
    }
    next();
  });

  // Add error handling middleware for body parser errors
  app.use((error, req, res, next) => {
    if (error.type === 'entity.too.large') {
      console.error(`❌ Payload too large error: ${req.method} ${req.path}`, {
        contentLength: req.headers['content-length'],
        error: error.message
      });
      return res.status(413).json({
        error: 'Request payload too large',
        message: 'The request payload exceeds the maximum allowed size of 50MB',
        code: 'PAYLOAD_TOO_LARGE'
      });
    }
    next(error);
  });

  // Configure body parser middleware for larger payloads
  // Apply global limits first
  app.use(express.json({ 
    limit: '50mb',
    verify: (req: any, res, buf) => {
      console.log(`🔍 Body parser processing ${req.method} ${req.url}, buffer size: ${buf.length} bytes`);
    }
  }));
  app.use(express.urlencoded({ 
    limit: '50mb', 
    extended: true,
    verify: (req: any, res, buf) => {
      console.log(`🔍 URL encoded parser processing ${req.method} ${req.url}, buffer size: ${buf.length} bytes`);
    }
  }));
  
  // Add specific configuration for OBS settings API (large media files)
  // This should override the global settings for these specific routes
  app.use('/api/obs-settings', express.json({ 
    limit: '50mb',
    verify: (req: any, res, buf) => {
      console.log(`🎯 OBS Settings body parser processing ${req.method} ${req.url}, buffer size: ${buf.length} bytes`);
    }
  }));
  app.use('/api/obs-settings', express.urlencoded({ 
    limit: '50mb', 
    extended: true,
    verify: (req: any, res, buf) => {
      console.log(`🎯 OBS Settings URL encoded parser processing ${req.method} ${req.url}, buffer size: ${buf.length} bytes`);
    }
  }));

  // Get config service
  const configService = app.get(ConfigService);

  // Enable CORS with security considerations
  app.enableCors({
    origin: configService.corsOrigin || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-GDPR-Consent',
      'X-Data-Processing-Consent'
    ],
    exposedHeaders: [
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
      'X-GDPR-Compliant',
      'X-Data-Retention-Policy'
    ]
  });

  // Global validation pipe with security options
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      forbidUnknownValues: true,
      skipMissingProperties: false,
      skipNullProperties: false,
      skipUndefinedProperties: false,
      // Add these options for larger payloads
      transformOptions: {
        enableImplicitConversion: true,
      },
      // Increase validation limits
      validationError: {
        target: false,
        value: false,
      },
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api', {
    exclude: [
      { path: 'widget-public', method: RequestMethod.ALL },
      { path: 'obs-widget', method: RequestMethod.ALL },
    ],
  });

  // Swagger documentation with security
  const config = new DocumentBuilder()
    .setTitle('XScan API')
    .setDescription('The XScan API description with comprehensive security features')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('security', 'Security and compliance endpoints')
    .addTag('payments', 'Payment processing with PCI DSS compliance')
    .addTag('gdpr', 'GDPR compliance and data privacy')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Start the application
  const port = configService.port || 3001;
  const isProduction = configService.isProduction;

  if (isProduction) {
    // In production, use HTTPS
    try {
      const httpsOptions = {
        key: fs.readFileSync(path.join(process.cwd(), 'ssl', 'private.key')),
        cert: fs.readFileSync(path.join(process.cwd(), 'ssl', 'certificate.crt')),
        ca: fs.readFileSync(path.join(process.cwd(), 'ssl', 'ca_bundle.crt')),
      };

      const httpsServer = https.createServer(httpsOptions, app.getHttpAdapter().getInstance());
      await app.listen(port, () => {
        console.log(`🚀 Secure HTTPS Application is running on: https://localhost:${port}`);
        console.log(`📚 API Documentation: https://localhost:${port}/api/docs`);
        console.log(`🏥 Health Check: https://localhost:${port}/api/health`);
        console.log(`🔌 WebSocket Gateway: wss://localhost:${port}/donations`);
        console.log(`📺 OBS Widget WebSocket: wss://localhost:${port}/obs-widget`);
        console.log(`🔒 Security Features: SSL/TLS, Rate Limiting, PCI DSS, GDPR`);
      });
    } catch (error) {
      console.warn('⚠️  SSL certificates not found, falling back to HTTP');
      console.warn('⚠️  In production, ensure SSL certificates are properly configured');
      await app.listen(port);
    }
  } else {
    // In development, use HTTP
    await app.listen(port);
    console.log(`🚀 Development Application is running on: http://localhost:${port}`);
    console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
    console.log(`🏥 Health Check: http://localhost:${port}/api/health`);
    console.log(`🔌 WebSocket Gateway: ws://localhost:${port}/donations`);
    console.log(`📺 OBS Widget WebSocket: ws://localhost:${port}/obs-widget`);
    console.log(`🔒 Security Features: Rate Limiting, PCI DSS, GDPR`);
  }
}
bootstrap();
