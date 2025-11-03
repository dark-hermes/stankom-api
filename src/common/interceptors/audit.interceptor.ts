import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request } from 'express';
import { Observable } from 'rxjs';

/**
 * Interceptor that automatically adds createdById and updatedById
 * to the request body based on the authenticated user.
 * - Adds createdById for POST requests (create operations)
 * - Adds updatedById for PUT/PATCH requests (update operations) if the entity supports it
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  // Paths without /api/v1 prefix for normalized matching
  private readonly entitiesWithUpdatedBy = [
    '/news/categories',
    // Add other entities that have updatedById field here
  ];
  private readonly entitiesWithCreatedBy = [
    '/news',
    '/news/categories',
    '/announcements',
    // Add other entities that have createdById field here
  ];

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const userId = request.user?.id;

    if (userId && request.body && typeof request.body === 'object') {
      const method = request.method;
      let path = request.path;
      // Strip the /api/v1 prefix if present to normalize path matching
      if (path.startsWith('/api/v1')) {
        path = path.substring(7); // Remove '/api/v1'
      }
      const body = request.body as Record<string, unknown>;

      // Add createdById for POST requests for entities that support it
      if (method === 'POST') {
        const supportsCreatedBy = this.entitiesWithCreatedBy.some(
          (entityPath) => {
            // match either exact entity path or entity path followed by a numeric id
            // e.g. '/news' or '/news/123' but not '/news/tags'
            const re = new RegExp(`^${entityPath}(?:/\\d+)?$`);
            return re.test(path);
          },
        );
        if (supportsCreatedBy) {
          body.createdById = userId;
        } else if ('createdById' in body) {
          // remove unexpected createdById to avoid validation errors
          delete body.createdById;
        }
        // also ensure updatedById isn't present on create requests
        if ('updatedById' in body) {
          delete body.updatedById;
        }
      }

      // Add updatedById for PUT/PATCH requests for entities that support it
      if (method === 'PUT' || method === 'PATCH') {
        const supportsUpdatedBy = this.entitiesWithUpdatedBy.some(
          (entityPath) => {
            const re = new RegExp(`^${entityPath}(?:/\\d+)?$`);
            return re.test(path);
          },
        );
        if (supportsUpdatedBy) {
          body.updatedById = userId;
        } else {
          // ensure we don't pass updatedById to DTOs that don't expect it
          if ('updatedById' in body) {
            delete body.updatedById;
          }
        }
      }
    }

    return next.handle();
  }
}
