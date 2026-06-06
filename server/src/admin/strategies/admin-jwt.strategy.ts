import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

type CookieRequest = Omit<Request, 'cookies'> & {
  cookies?: Record<string, string>;
};

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: CookieRequest) => req?.cookies?.admin_access_token ?? null,
      ]),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_ADMIN_ACCESS_SECRET') ??
        'dev-admin-access-secret',
    });
  }

  validate(payload: { sub: number; email: string }) {
    return { adminId: payload.sub, email: payload.email };
  }
}
