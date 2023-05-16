import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UppyService } from './uppy.service';
import { CreateUppyDto } from './dto/create-uppy.dto';
import { UpdateUppyDto } from './dto/update-uppy.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { fileFilter } from '../files/helpers/fileFilter.helper';
import { diskStorage } from 'multer';
import { fileNamer } from '../files/helpers/fileNamer.helper';

@Controller('uppy')
export class UppyController {
  constructor(private readonly uppyService: UppyService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './static/products_v2',
        filename: fileNamer
      })
    }),
  )
  uploadFile(
    // @UploadedFile() files: Express.Multer.File[],
    @UploadedFile() file: Express.Multer.File 
  ) {
    return {
      ok: true,
      defaultFileName: file
    };
  }

}
