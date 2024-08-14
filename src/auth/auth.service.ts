import { Injectable, Scope, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  UserCreateDto,
  UserLoginDto,
  UserUpdateTokenDto,
} from 'src/user/user.dto';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';

@Injectable({ scope: Scope.REQUEST })
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async createUser(user: UserCreateDto) {
    const newUser = await this.userService.createUser(user);
    const tokens: UserUpdateTokenDto = {
      jwt: this.jwtService.sign({
        sub: newUser.id,
        username: newUser.username,
      }),
    };
    await this.userService.updateTokens(tokens, newUser.id);
    return { userInfo: newUser, access_token: tokens };
  }

  /// LOGIN ////////////////////////////////////

  async login(user: UserLoginDto) {
    const loginedUser = await this.userService.findUserByUsername(
      user.username,
    );
    if (!loginedUser) {
      throw new UnauthorizedException();
    }
    const payload = {
      sub: loginedUser.id,
      username: loginedUser.username,
      iat: new Date().getTime(),
    };
    const isMatch = await bcrypt.compare(user.password, loginedUser.password);
    if (isMatch) {
      const tokens: UserUpdateTokenDto = {
        jwt: this.jwtService.sign(payload),
      };
      await this.userService.updateTokens(tokens, loginedUser.id.toString());
      return {
        user: {
          id: loginedUser.id,
          username: loginedUser.username,
        },
        access_token: tokens.jwt,
      };
    } else {
      throw new UnauthorizedException();
    }
  }

  // LOGOUT //////////////////////////////////

  async logout(userId: string) {
    return this.userService.updateTokens({ jwt: null }, userId);
  }

  // REFRESH ////////////////////////////////

  async refreshToken(token: string) {
    const info: any = this.jwtService.decode(token);
    const payload = {
      sub: info.sub,
      username: info.username,
      role: info.role,
      iat: new Date().getTime(),
    };

    const userToken: UserUpdateTokenDto = {
      jwt: this.jwtService.sign(payload),
    };
    await this.userService.updateTokens(userToken, info.sub);
    return { access_token: userToken.jwt };
  }

  //   async findRefreshToken(token: string) {
  //     return await this.userService.findByRefreshToken(token);
  //   }

  //   async findAccessToken(token: string) {
  //     return await this.userService.findByAccessToken(token);
  //   }
}
