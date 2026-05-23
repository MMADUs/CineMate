import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminJwtStrategy } from './strategies/admin-jwt.strategy';
import { AdminRefreshStrategy } from './strategies/admin-refresh.strategy';

@Module({
  imports: [PassportModule, JwtModule.register({})],
  controllers: [AdminController],
  providers: [AdminService, AdminJwtStrategy, AdminRefreshStrategy],
})
export class AdminModule {}
