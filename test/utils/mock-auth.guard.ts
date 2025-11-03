/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { CanActivate, ExecutionContext } from '@nestjs/common';

export class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    // provide a default test user
    req.user = { id: 2, email: 'e2e@example.com' };
    return true;
  }
}
