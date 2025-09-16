import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ConfigService } from '../../config/config.service';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();
      const token = this.extractTokenFromHeader(client);

      if (!token) {
        throw new WsException('Unauthorized - No token provided');
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.jwtSecret,
      });

      // Attach user info to socket for later use
      client.data.user = payload;

      return true;
    } catch (error) {
      throw new WsException('Unauthorized - Invalid token');
    }
  }

  private extractTokenFromHeader(client: Socket): string | undefined {
    const authHeader =
      client.handshake.auth.token || client.handshake.headers.authorization;

    if (!authHeader) {
      return undefined;
    }

    if (authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    return authHeader;
  }
}
