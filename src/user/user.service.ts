import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Scope,
} from '@nestjs/common';
import {
  User,
  UserCreateDto,
  UserLoginDto,
  UserUpdateTokenDto,
} from './user.dto';
import { REQUEST } from '@nestjs/core';
import { PrismaService } from 'src/config/prisma.service';
import * as bcrypt from 'bcrypt';
@Injectable({ scope: Scope.REQUEST })
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(userCreateDto: UserCreateDto) {
    const user = await this.prisma.user.findFirst({
      where: { username: userCreateDto.username },
    });
    if (user) {
      throw new HttpException(
        'User with this username is already exist',
        HttpStatus.BAD_REQUEST,
      );
    }
    const saltOrRound = 16;
    const salt = await bcrypt.genSalt(saltOrRound);
    const hash = await bcrypt.hash(userCreateDto.password, salt);
    userCreateDto.password = hash;
    const newUser = await this.prisma.user.create({ data: userCreateDto });
    return { id: newUser.id, username: newUser.username, email: newUser.email };
  }

  async loginUser(user: UserLoginDto) {
    const loginedUser = await this.prisma.user.findFirst({
      where: {
        username: user.username,
      },
    });
    if (loginedUser) {
      const isMatch = await bcrypt.compare(user.password, loginedUser.password);
      if (isMatch) {
        loginedUser.password = user.password;
        return {
          id: loginedUser.id,
          username: loginedUser.username,
          email: loginedUser.email,
        };
      } else {
        throw new HttpException('Unauthrized', HttpStatus.UNAUTHORIZED);
      }
    } else {
      throw new HttpException('Unauthrized', HttpStatus.UNAUTHORIZED);
    }
  }

  async findUserByUsername(username: string) {
    return await this.prisma.user.findFirst({
      where: {
        username: username,
      },
      select: { id: true, username: true, email: true, password: true },
    });
  }

  async findUserById(id: string) {
    return await this.prisma.user.findUnique({
      select: { id: true, username: true, email: true },
      where: { id: id },
    });
  }

  async findUserAndUpdatePassword(
    id: string,
    newPassword: string[],
    oldPassword: string,
  ) {
    const oldPasswordInDB = await this.prisma.user.findUnique({
      where: { id: id },
    });
    if (oldPasswordInDB) {
      const isMatch = await bcrypt.compare(
        oldPassword,
        oldPasswordInDB.password,
      );
      if (newPassword[0] === newPassword[1]) {
        if (isMatch) {
          const hash = await bcrypt.hash(newPassword[1], 10);

          return await this.prisma.user.update({
            where: { id: id },
            data: { password: hash },
            select: { username: true, email: true, id: true },
          });
        } else
          throw new HttpException(
            'Password not correct',
            HttpStatus.BAD_REQUEST,
          );
      } else
        throw new HttpException(
          'new password and confirm password not the same',
          HttpStatus.BAD_REQUEST,
        );
    } else throw new HttpException('User not exist', HttpStatus.BAD_REQUEST);
  }

  async findUserAndUpdateUsername(
    id: string,
    password: string,
    newUsername: string,
  ) {
    const oldUserInBase = await this.prisma.user.findUnique({
      where: { id: id },
    });
    if (oldUserInBase) {
      const isMatch = await bcrypt.compare(password, oldUserInBase.password);
      if (isMatch) {
        return await this.prisma.user.update({
          where: { id: id },
          data: { username: newUsername },
          select: { id: true, username: true, email: true },
        });
      } else
        throw new HttpException('Password not correct', HttpStatus.BAD_REQUEST);
    } else throw new HttpException('User not exist', HttpStatus.BAD_REQUEST);
  }

  async deleteUserById(id: string) {
    return await this.prisma.user.delete({ where: { id: id } });
  }

  async updateTokens(userToken: UserUpdateTokenDto, id: string) {
    return await this.prisma.user.update({
      where: { id: id },
      data: userToken,
      select: { username: true, id: true, email: true },
    });
  }
}
