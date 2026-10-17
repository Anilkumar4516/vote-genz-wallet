import { Injectable, Logger } from '@nestjs/common';
import { VoterManagementService, RegisterVoterDto } from './voter-management.service';
import { PhotoUploadService } from './photo-upload.service';

@Injectable()
export class VotersService {
  private readonly logger = new Logger(VotersService.name);

  constructor(
    private readonly voterManagement: VoterManagementService,
    private readonly photoUpload: PhotoUploadService,
  ) {}

  async createVoter(dto: RegisterVoterDto) {
    return this.voterManagement.registerVoter(dto);
  }

  async updateVoterStatus(id: string, status: 'ACTIVE' | 'SUSPENDED' | 'REVOKED') {
    return this.voterManagement.updateVoterStatus(id, status);
  }

  async attachPhoto(nationalId: string, base64Photo: string) {
    const uploadResult = await this.photoUpload.uploadVoterPhoto(nationalId, base64Photo);
    return uploadResult;
  }
}
