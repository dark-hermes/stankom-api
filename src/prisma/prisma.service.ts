import {
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnApplicationShutdown
{
  constructor() {
    // @typescript-eslint/no-unsafe-call on the generated PrismaClient constructor call.

    super({
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
    } as ConstructorParameters<typeof PrismaClient>[0]);
  }

  async onModuleInit() {
    await (this.$connect as () => Promise<void>)();
  }

  onApplicationShutdown() {
    process.once('beforeExit', () => {
      console.log('Prisma client disconnecting due to app shutdown...');
      void (this.$disconnect as () => Promise<void>)();
    });
  }
}
