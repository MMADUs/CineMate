import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

type CookieRequest = Omit<Request, 'cookies'> & {
  cookies?: Record<string, string>;
};

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: CookieRequest) => req?.cookies?.refresh_token ?? null,
      ]),
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKey:
        configService.get<string>('JWT_REFRESH_SECRET') ?? 'dev-refresh-secret',
    });
  }

  validate(req: CookieRequest, payload: { sub: string; email: string }) {
    return {
      userId: payload.sub,
      email: payload.email,
      refreshToken: req.cookies?.refresh_token,
    };
  }
}
