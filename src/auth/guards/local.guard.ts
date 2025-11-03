import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * This guard triggers the LocalStrategy.
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}

// Export as LocalGuard for consistency
export { LocalAuthGuard as LocalGuard };
