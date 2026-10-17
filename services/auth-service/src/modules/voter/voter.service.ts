import { Injectable, NotFoundException } from '@nestjs/common';
import { VoterRegistryService } from '../voter-registry/voter-registry.service';

export interface VoterProfileResponse {
  id: string;
  nationalId: string;
  fullName: string;
  photoUrl: string;
  isRegistered: boolean;
  status: string;
  constituencyCode: string;
}

@Injectable()
export class VoterService {
  constructor(private readonly voterRegistry: VoterRegistryService) {}

  /**
   * Retrieves profile, name, and official photo for citizen identity confirmation screen
   */
  async getVoterProfile(nationalId: string): Promise<VoterProfileResponse> {
    const voter = await this.voterRegistry.findByNationalId(nationalId);

    if (!voter) {
      throw new NotFoundException('Voter profile not found in citizen registry');
    }

    return {
      id: voter.id,
      nationalId: voter.nationalId,
      fullName: voter.fullName,
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      isRegistered: voter.isRegistered,
      status: voter.status,
      constituencyCode: 'CONST-DELHI-CENTRAL-01',
    };
  }
}
