import { Test, TestingModule } from '@nestjs/testing';
import { NriController } from './api.controller';
import { NriService } from './api.service';

describe('NriController', () => {
  let nriController: NriController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [NriController],
      providers: [NriService],
    }).compile();

    nriController = app.get<NriController>(NriController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(nriController.getHello()).toBe('Hello World!');
    });
  });
});
