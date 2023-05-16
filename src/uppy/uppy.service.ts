import { Injectable } from '@nestjs/common';
import { CreateUppyDto } from './dto/create-uppy.dto';
import { UpdateUppyDto } from './dto/update-uppy.dto';

@Injectable()
export class UppyService {
  upload(files: any) {

    console.log({files})

    return "Hoal munfo";
  }
}
