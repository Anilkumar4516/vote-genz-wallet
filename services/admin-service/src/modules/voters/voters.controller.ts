import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { VotersService } from './voters.service';
import { BulkImportService } from './bulk-import.service';
import { RegisterVoterDto } from './voter-management.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

class BulkImportDto {
  csvData: string;
}

class PhotoUploadDto {
  nationalId: string;
  base64Image: string;
}

@Controller('admin/voters')
@UseGuards(RolesGuard)
@Roles('ADMIN')
export class VotersController {
  constructor(
    private readonly votersService: VotersService,
    private readonly bulkImportService: BulkImportService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async registerVoter(@Body() body: RegisterVoterDto) {
    return this.votersService.createVoter(body);
  }

  @Post('bulk-import')
  @HttpCode(HttpStatus.OK)
  async bulkImport(@Body() body: BulkImportDto) {
    return this.bulkImportService.importVotersFromCsv(body.csvData);
  }

  @Post('photo')
  @HttpCode(HttpStatus.OK)
  async uploadPhoto(@Body() body: PhotoUploadDto) {
    return this.votersService.attachPhoto(body.nationalId, body.base64Image);
  }
}
