/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { CanActivate, ExecutionContext } from '@nestjs/common';

// shared mock user used by tests; tests can call setMockUser to change this
export let mockUser: { id: number; email?: string } = {
  id: 2,
  email: 'e2e@example.com',
};

export function setMockUser(user: { id: number; email?: string }) {
  mockUser = user;
}

export class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    // provide the current mock user
    req.user = mockUser;
    return true;
  }
}
