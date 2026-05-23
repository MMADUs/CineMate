import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

type CookieRequest = Omit<Request, 'cookies'> & {
  cookies?: Record<string, string>;
};

@Injectable()
export class AdminRefreshStrategy extends PassportStrategy(
  Strategy,
  'admin-refresh',
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: CookieRequest) => req?.cookies?.admin_refresh_token ?? null,
      ]),
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKey:
        configService.get<string>('JWT_ADMIN_REFRESH_SECRET') ??
        'dev-admin-refresh-secret',
    });
  }

  validate(req: CookieRequest, payload: { sub: number; email: string }) {
    return {
      adminId: payload.sub,
      email: payload.email,
      refreshToken: req.cookies?.admin_refresh_token,
    };
  }
}
