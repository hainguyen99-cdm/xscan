import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const expiresIn = configService.jwtExpiresIn || '24h';
        // Convert string format to seconds if needed
        let expiresInSeconds: number;
        if (typeof expiresIn === 'string') {
          if (expiresIn.endsWith('h')) {
            expiresInSeconds = parseInt(expiresIn.replace('h', '')) * 3600;
          } else if (expiresIn.endsWith('d')) {
            expiresInSeconds = parseInt(expiresIn.replace('d', '')) * 86400;
          } else if (expiresIn.endsWith('m')) {
            expiresInSeconds = parseInt(expiresIn.replace('m', '')) * 60;
          } else {
            expiresInSeconds = parseInt(expiresIn) || 86400; // Default to 24 hours
          }
        } else {
          expiresInSeconds = expiresIn;
        }
        
        return {
          secret:
            configService.jwtSecret ||
            'your-super-secret-jwt-key-change-in-production',
          signOptions: {
            expiresIn: expiresInSeconds,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
