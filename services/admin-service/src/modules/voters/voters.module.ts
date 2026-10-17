import { Module } from '@nestjs/common';
import { VotersController } from './voters.controller';
import { VotersService } from './voters.service';
import { VoterManagementService } from './voter-management.service';
import { PhotoUploadService } from './photo-upload.service';
import { BulkImportService } from './bulk-import.service';

@Module({
  controllers: [VotersController],
  providers: [
    VotersService,
    VoterManagementService,
    PhotoUploadService,
    BulkImportService,
  ],
  exports: [VotersService, VoterManagementService, PhotoUploadService],
})
export class VotersModule {}
