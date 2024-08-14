import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@ApiTags('User controller')
@UseGuards(AuthGuard)
@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  @ApiOperation({ summary: 'Get user' })
  @ApiBearerAuth('JWT-auth')
  @Get('me/')
  async getUser(@Req() req: Request) {
    const id = this.jwtService.decode(
      req.headers.authorization.split(' ')[1],
    ).sub;
    return this.userService.findUserById(id);
  }
}
