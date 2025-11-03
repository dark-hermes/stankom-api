import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

/**
 * Decorator to extract the current user ID from the request
 * Usage: @CurrentUserId() userId: number
 */
export const CurrentUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): number => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user?.id ?? 0;
  },
);
