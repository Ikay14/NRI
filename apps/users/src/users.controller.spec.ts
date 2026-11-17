import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: jest.Mocked<Partial<UsersService>>;

  beforeEach(async () => {
    usersService = {
      getHello: jest.fn().mockReturnValue('Hello World!'),
      getPublicProfile: jest.fn().mockResolvedValue({
        userId: 'user-1',
        firstName: 'Ada',
        lastName: 'Lovelace',
        fullName: 'Ada Lovelace',
        avatar: '',
        bio: '',
        location: '',
      }),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
    }).compile();

    usersController = app.get<UsersController>(UsersController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(usersController.getHello()).toBe('Hello World!');
    });
  });

  it('forwards userId to getPublicProfile', async () => {
    const profile = await usersController.getPublicProfile('user-1');
    expect(usersService.getPublicProfile).toHaveBeenCalledWith('user-1');
    expect(profile?.userId).toBe('user-1');
  });
});
