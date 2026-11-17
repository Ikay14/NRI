import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './role.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Partial<Reflector>>;

  beforeEach(() => {
    reflector = {
      get: jest.fn(),
    };
    guard = new RolesGuard(reflector as unknown as Reflector);
  });

  const createContext = (user: any): ExecutionContext =>
    ({
      getHandler: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    }) as unknown as ExecutionContext;

  it('allows access when user.role matches requiredRoles', () => {
    (reflector.get as jest.Mock).mockReturnValue(['admin']);
    expect(guard.canActivate(createContext({ role: 'admin' }))).toBe(true);
  });

  it('denies access when user.role does not match requiredRoles', () => {
    (reflector.get as jest.Mock).mockReturnValue(['admin']);
    expect(() => guard.canActivate(createContext({ role: 'user' }))).toThrow(
      ForbiddenException,
    );
  });
});
