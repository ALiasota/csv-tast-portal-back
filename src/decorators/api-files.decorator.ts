import { UseInterceptors, applyDecorators } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

export function ApiFiles(
  fieldName = 'files',
  maxCount = 10,
  localOptions?: MulterOptions,
) {
  return applyDecorators(
    UseInterceptors(FilesInterceptor(fieldName, maxCount, localOptions)),
    ApiConsumes('multipart/form-data'),
    ApiBody,
  );
}

export function ApiFile(fieldName = 'file', localOptions?: MulterOptions) {
  return applyDecorators(
    UseInterceptors(FileInterceptor(fieldName, localOptions)),
    ApiConsumes('multipart/form-data'),
    ApiBody,
  );
}
