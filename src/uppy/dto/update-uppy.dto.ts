import { PartialType } from '@nestjs/mapped-types';
import { CreateUppyDto } from './create-uppy.dto';

export class UpdateUppyDto extends PartialType(CreateUppyDto) {}
