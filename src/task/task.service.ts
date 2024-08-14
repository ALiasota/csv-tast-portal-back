import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma.service';
import { TaskCreateDto } from './dto/task.create.dto';
import { parse } from 'csv-parse';
import { createReadStream } from 'fs';

@Injectable()
export class TaskService {
  constructor(private readonly prismaService: PrismaService) {}

  async getTask(id: string) {
    return this.prismaService.task.findUnique({ where: { id: id } });
  }

  async getAllTaskByUserId(user_id: string) {
    return this.prismaService.task.findMany({ where: { user_id: user_id } });
  }

  async createTask(task: TaskCreateDto) {
    return this.prismaService.task.create({ data: task });
  }

  async updateTask(id: string, task: Partial<TaskCreateDto>) {
    return this.prismaService.task.update({ where: { id: id }, data: task });
  }
  async deleteTask(id: string) {
    return this.prismaService.task.delete({ where: { id: id } });
  }
  async createTasksWithFile(file: Express.Multer.File, user_id: string) {
    const parser = parse({
      delimiter: ',',
      from_line: 1,
      skip_empty_lines: true,
      skip_records_with_error: true,
      relax_column_count_less: true,
      relax_column_count_more: true,
    });
    const csvStream = createReadStream(
      `./uploaded/csv/${file.filename}`,
      'utf8',
    );
    let titleInx = 0;
    let descInx = 0;
    let first = true;
    const tasks: TaskCreateDto[] = [];
    const onData = async (row: string[]) => {
      for (let i = 0; i < row.length; i++) {
        if (first) {
          first = false;
          for (let i = 0; i < row.length; i++) {
            switch (row[i].toLowerCase()) {
              case 'title':
                titleInx = i;
                break;
              case 'description':
                descInx = i;
                break;
            }
          }
        } else {
          tasks.push({
            title: row[titleInx],
            description: row[descInx],
            user_id: user_id,
            completed: false,
          });
        }
      }
    };
    const result = await new Promise<any>(async (res, rej) => {
      csvStream.pipe(
        parser
          .on('data', onData)
          .on('end', async () => {
            const uploadingResult = await this.prismaService.task.createMany({
              data: tasks,
            });
            res(uploadingResult);
          })
          .on('error', function (error) {
            rej(error);
          }),
      );
    });
    await result;
    return result;
  }
}
