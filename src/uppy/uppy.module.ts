import { Module } from '@nestjs/common';
import { UppyService } from './uppy.service';
import { UppyController } from './uppy.controller';

@Module({
  controllers: [UppyController],
  providers: [UppyService]
})
export class UppyModule {}
