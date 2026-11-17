import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { timingSafeEqual } from 'crypto';

@Injectable()
export class InternalServiceGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const provided = request.headers['x-service-token'];
    const expected = process.env.INTERNAL_SERVICE_TOKEN;

    if (typeof provided !== 'string' || !expected) {
      throw new UnauthorizedException('Invalid service token');
    }

    const providedBuf = Buffer.from(provided);
    const expectedBuf = Buffer.from(expected);

    if (
      providedBuf.length !== expectedBuf.length ||
      !timingSafeEqual(providedBuf, expectedBuf)
    ) {
      throw new UnauthorizedException('Invalid service token');
    }

    return true;
  }
}
