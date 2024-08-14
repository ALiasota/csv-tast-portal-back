import {
  HttpException,
  HttpStatus,
  UseInterceptors,
  applyDecorators,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  MulterField,
  MulterOptions,
} from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { ApiFile, ApiFiles } from './api-files.decorator';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

export type UploadedFields = MulterField & { required?: boolean };

export function ApiFileFields(
  uploadFields: UploadedFields[],
  localOptions?: MulterOptions,
) {
  return applyDecorators(
    UseInterceptors(FileFieldsInterceptor(uploadFields, localOptions)),
    ApiConsumes('multipart/form-data'),
    ApiBody,
  );
}

export function ApiCsvFile(fileName = 'task_csv', required = false) {
  return ApiFile(fileName, {
    storage: diskStorage({
      destination: './uploaded/csv',
      filename: (req, file, cb) => {
        cb(null, `${file.originalname}`);
      },
    }),
    fileFilter: function (req, file, cb) {
      if (file.mimetype === 'text/csv') cb(null, true);
      else
        cb(new HttpException('Wrong file type', HttpStatus.BAD_REQUEST), false);
    },
  });
}

export function ApiImgFiles(fileName = 'tast_csv', maxCount = 10) {
  return ApiFiles(fileName, maxCount, {
    storage: diskStorage({
      destination: './uploaded/csv',
      filename: (req, file, cb) => {
        cb(null, `${file.originalname}`);
      },
    }),
    fileFilter: function (req, file, cb) {
      if (file.mimetype === 'text/csv') cb(null, true);
      else
        cb(new HttpException('Wrong file type', HttpStatus.BAD_REQUEST), false);
    },
  });
}
