import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskCreateDto } from './dto/task.create.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiCsvFile } from 'src/decorators/api-file.fields.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@ApiTags('Task controller')
@UseGuards(AuthGuard)
@Controller('task')
export class TaskController {
  constructor(
    private readonly taskService: TaskService,
    private readonly jwtService: JwtService,
  ) {}

  @ApiOperation({ summary: 'Get task by id' })
  @ApiBearerAuth('JWT-auth')
  @Get('/:id')
  async getTask(@Param('id') id: string) {
    return this.taskService.getTask(id);
  }

  @ApiOperation({ summary: 'Get all task by user_id' })
  @ApiBearerAuth('JWT-auth')
  @Get('/')
  async getAllTasksByUserId(@Req() req: Request) {
    const id = this.jwtService.decode(
      req.headers.authorization.split(' ')[1],
    ).sub;
    return this.taskService.getAllTaskByUserId(id);
  }

  @ApiOperation({ summary: 'Create task' })
  @ApiBearerAuth('JWT-auth')
  @Post('/')
  @ApiBody({ type: TaskCreateDto })
  async createTask(@Body() task: TaskCreateDto, @Req() req: Request) {
    const id = this.jwtService.decode(
      req.headers.authorization.split(' ')[1],
    ).sub;
    task.user_id = id;
    return this.taskService.createTask(task);
  }

  @ApiOperation({ summary: 'Update task' })
  @ApiBearerAuth('JWT-auth')
  @Patch('/:id')
  @ApiBody({ type: TaskCreateDto })
  async updateTask(
    @Body() task: Partial<TaskCreateDto>,
    @Param('id') id: string,
  ) {
    return this.taskService.updateTask(id, task);
  }
  @ApiOperation({ summary: 'Delete tasks' })
  @ApiBearerAuth('JWT-auth')
  @Delete('/:id')
  async deleteTask(@Param('id') id: string) {
    return this.taskService.deleteTask(id);
  }
  @ApiOperation({ summary: 'Upload task from csv file' })
  @ApiBearerAuth('JWT-auth')
  @Post('/file')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiCsvFile('file', true)
  async createTasksWithFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    const id = this.jwtService.decode(
      req.headers.authorization.split(' ')[1],
    ).sub;
    return this.taskService.createTasksWithFile(file, id);
  }
}
