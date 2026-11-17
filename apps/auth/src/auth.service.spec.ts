import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';

describe('AuthService', () => {
  let service: AuthService;
  let authRepository: jest.Mocked<Partial<AuthRepository>>;
  let jwtService: jest.Mocked<Partial<JwtService>>;
  let httpService: jest.Mocked<Partial<HttpService>>;

  beforeEach(() => {
    authRepository = {
      findByEmail: jest.fn(),
      hashPassword: jest.fn(),
      create: jest.fn(),
      setRefreshToken: jest.fn(),
      validateRefreshToken: jest.fn(),
      validatePassword: jest.fn(),
      validateOtp: jest.fn(),
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('signed-token'),
      verifyAsync: jest.fn(),
      verify: jest.fn(),
    };
    httpService = {
      post: jest.fn().mockReturnValue(of({ data: {} })),
    };

    service = new AuthService(
      authRepository as unknown as AuthRepository,
      jwtService as unknown as JwtService,
      httpService as unknown as HttpService,
    );
  });

  it('signs JWTs with user.email (not user.id) on createUser', async () => {
    (authRepository.findByEmail as jest.Mock).mockResolvedValue(null);
    (authRepository.hashPassword as jest.Mock).mockResolvedValue('hashed-pw');
    (authRepository.create as jest.Mock).mockResolvedValue({
      id: 'user-123',
      email: 'ada@example.com',
      role: 'user',
    });

    await service.createUser({
      email: 'ada@example.com',
      password: 'StrongPassword1!',
      firstName: 'Ada',
      lastName: 'Lovelace',
    });

    expect(jwtService.sign).toHaveBeenCalledWith(
      { sub: 'user-123', email: 'ada@example.com', role: 'user' },
      expect.any(Object),
    );
    expect(httpService.post).toHaveBeenCalledWith(
      expect.stringContaining('/users/create-profile'),
      expect.objectContaining({ userId: 'user-123', email: 'ada@example.com' }),
      expect.any(Object),
    );
  });

  it('rejects refreshToken when payload.sub does not match id', async () => {
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({
      sub: 'other-user',
      email: 'ada@example.com',
      role: 'user',
    });

    await expect(service.refreshToken('user-123', 'refresh-tok')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rotates and persists refreshToken using payload.sub', async () => {
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({
      sub: 'user-123',
      email: 'ada@example.com',
      role: 'user',
    });
    (authRepository.validateRefreshToken as jest.Mock).mockResolvedValue(true);

    const tokens = await service.refreshToken('user-123', 'old-refresh');

    expect(tokens).toEqual({
      accessToken: 'signed-token',
      refreshToken: 'signed-token',
    });
    expect(jwtService.sign).toHaveBeenCalledWith(
      { sub: 'user-123', email: 'ada@example.com', role: 'user' },
      expect.any(Object),
    );
    expect(authRepository.setRefreshToken).toHaveBeenCalledWith('user-123', 'signed-token');
  });
});
