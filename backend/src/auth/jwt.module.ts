import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '../config/config.module';
import { UsersModule } from '../users/users.module';
import { CommonModule } from '../common/common.module';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    CommonModule,
    PassportModule,
    JwtModule.register({
      secret: 'your-super-secret-jwt-key-change-in-production',
      signOptions: {
        expiresIn: '24h',
      },
    }),
  ],
  providers: [
    JwtStrategy,
    LocalStrategy,
    LocalAuthGuard,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [JwtModule, LocalAuthGuard, JwtAuthGuard, RolesGuard],
})
export class AuthJwtModule {}
