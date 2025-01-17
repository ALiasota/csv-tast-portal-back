import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { IS_PUBLIC_KEY } from './public.declaration';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    @Inject(AuthService) private authService: AuthService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload: any = this.jwtService.decode(token);
      //const founded = await this.authService.findAccessToken(token);
      if (payload.exp < new Date().getTime()) {
        return false;
      }
      request['user'] = payload;
    } catch (e) {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const header: any = request.headers;
    const [type, token] = header.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
