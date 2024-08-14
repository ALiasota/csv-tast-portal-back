import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiCreatedResponse,
  ApiBody,
  ApiTags,
  ApiBearerAuth,
  ApiHeader,
  ApiResponse,
} from '@nestjs/swagger';
import { validate } from 'class-validator';
import { UserCreateDto, UserLoginDto, User } from 'src/user/user.dto';
import { AuthService } from './auth.service';
import { Public } from './public.declaration';
import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { access } from 'fs';

@ApiTags('Auth controller')
@Controller('auth')
@UseGuards(AuthGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // CREATE ////////////////////////

  @ApiOperation({ summary: 'Create new user' })
  @ApiCreatedResponse({ description: 'User created' })
  @ApiBody({ type: UserCreateDto })
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('create/')
  async createUser(@Body() user: UserCreateDto) {
    return this.authService.createUser(user);
  }

  @ApiOperation({ summary: 'Login user' })
  @ApiCreatedResponse({ description: 'User logined' })
  @ApiBody({ type: UserLoginDto })
  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('login/')
  async loginUser(@Body() user: UserLoginDto) {
    const errors = await validate(user);
    if (errors.length > 0) {
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }
    return this.authService.login(user);
  }

  //   @ApiOperation({
  // //     summary: 'Check route',
  // //     description: 'Route for checking access token',
  // //   })
  // //   @ApiCreatedResponse({ description: 'Token valid' })
  // //   @HttpCode(HttpStatus.OK)
  // //   @ApiBearerAuth('JWT-auth')
  // //   @Public()
  // //   @Get('/check')
  // //   async checkToken(@Req() req: Request) {
  // //     const tokens: any = req.headers;
  // //     const refresh_token = tokens.refresh_token.split(' ')[1];
  // //     const user = await this.authService.findAccessToken(
  // //       tokens.authorization.split(' ')[1],
  // //     );
  // //     const verified = this.jwtService.verify(tokens.authorization.split(' ')[1]);
  // //     if (user && verified.exp >= new Date().getTime()) {
  // //       return true;
  // //     } else if (await this.authService.findRefreshToken(refresh_token)) {
  // //       return this.authService.refreshToken(refresh_token);
  // //     } else return false;
  // //   }
}
