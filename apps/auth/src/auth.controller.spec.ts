import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: jest.Mocked<Partial<AuthService>>;

  beforeEach(async () => {
    authService = {
      getHello: jest.fn().mockReturnValue('Hello World!'),
      login: jest.fn().mockResolvedValue({
        user: { id: 'user-1', email: 'ada@example.com' } as any,
        accessToken: 'access-tok',
        refreshToken: 'refresh-tok',
      }),
      refreshToken: jest.fn().mockResolvedValue({
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
      }),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    authController = app.get<AuthController>(AuthController);
  });

  it('should return "Hello World!"', () => {
    expect(authController.getHello()).toBe('Hello World!');
  });

  it('sets cookies on login without exposing tokens in JSON body', async () => {
    const res = { cookie: jest.fn() } as any;
    const result = await authController.login(
      { email: 'ada@example.com', password: 'StrongPassword1!' },
      res,
    );

    expect(res.cookie).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      user: { id: 'user-1', email: 'ada@example.com' },
    });
  });

  it('forwards userId and refreshToken to authService.refreshToken', async () => {
    const result = await authController.refreshToken('user-1', 'refresh-tok');

    expect(authService.refreshToken).toHaveBeenCalledWith('user-1', 'refresh-tok');
    expect(result).toEqual({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
    });
  });
});
