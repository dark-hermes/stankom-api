import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return req.signedCookies?.['access_token'] || null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret') || 'default-secret',
    });
  }

  /**
   * Passport calls this method after verifying the JWT signature.
   * The `payload` is the decoded JWT.
   */
  async validate(payload: { sub: number; email: string }) {
    try {
      const user = await this.usersService.findOneById(payload.sub);
      return user;
    } catch (err: unknown) {
      void err;
      throw new UnauthorizedException('User not found');
    }
  }
}
