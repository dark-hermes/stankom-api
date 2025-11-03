import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * This guard triggers the JwtStrategy.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

// Export as JwtGuard for consistency
export { JwtAuthGuard as JwtGuard };
