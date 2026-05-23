import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('healthcheck', () => {
    it('should return API health status', () => {
      const response = appController.healthcheck();
      expect(response.status).toBe('ok');
      expect(response.service).toBe('CineMate API');
      expect(Date.parse(response.timestamp)).not.toBeNaN();
    });
  });
});
