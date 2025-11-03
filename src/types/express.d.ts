import type { User } from '@prisma/client';

export type SanitizedUser = Omit<User, 'password'>;

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends Omit<import('@prisma/client').User, 'password'> {}
  }
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: SanitizedUser;
  }
}
