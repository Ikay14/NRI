import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { InternalServiceGuard } from './internal-service.guard';

describe('InternalServiceGuard', () => {
  const originalToken = process.env.INTERNAL_SERVICE_TOKEN;
  let guard: InternalServiceGuard;

  beforeEach(() => {
    process.env.INTERNAL_SERVICE_TOKEN = 'super-secret-internal-token';
    guard = new InternalServiceGuard();
  });

  afterEach(() => {
    process.env.INTERNAL_SERVICE_TOKEN = originalToken;
  });

  const createContext = (headers: Record<string, string>): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ headers }),
      }),
    }) as unknown as ExecutionContext;

  it('allows requests with matching x-service-token', () => {
    expect(
      guard.canActivate(createContext({ 'x-service-token': 'super-secret-internal-token' })),
    ).toBe(true);
  });

  it('rejects requests with missing or mismatched x-service-token', () => {
    expect(() => guard.canActivate(createContext({}))).toThrow(UnauthorizedException);
    expect(() =>
      guard.canActivate(createContext({ 'x-service-token': 'wrong-token' })),
    ).toThrow(UnauthorizedException);
  });
});
