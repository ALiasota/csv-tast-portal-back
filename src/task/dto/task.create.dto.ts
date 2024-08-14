import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmpty,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class TaskCreateDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ default: 'Task Title' })
  title: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ default: 'Task Description' })
  description: string;

  @IsEmpty()
  user_id: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ default: false })
  completed: boolean;
}
