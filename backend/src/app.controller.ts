import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): object {
    return {
      message: 'Welcome to XScan API',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        docs: '/api/docs',
        health: '/api/health',
        auth: '/api/auth',
        users: '/api/users',
        scans: '/api/scans',
      },
      timestamp: new Date().toISOString(),
    };
  }
}
