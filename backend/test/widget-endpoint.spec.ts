import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Widget Endpoint (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/obs-settings/widget/streamer-:streamerId/:alertToken (GET)', () => {
    it('should return 404 for invalid streamer ID and token combination', () => {
      return request(app.getHttpServer())
        .get('/obs-settings/widget/streamer-invalid-id/invalid-token')
        .expect(404);
    });

    it('should return HTML content type for valid requests', () => {
      // This test would need a valid streamer ID and token to pass
      // For now, we're just testing the endpoint structure
      return request(app.getHttpServer())
        .get('/obs-settings/widget/streamer-test-id/test-token')
        .expect('Content-Type', /html/);
    });
  });

  describe('/obs-settings/widget-url/:streamerId (GET)', () => {
    it('should require authentication', () => {
      return request(app.getHttpServer())
        .get('/obs-settings/widget-url/test-streamer-id')
        .expect(401); // Unauthorized
    });
  });
}); 