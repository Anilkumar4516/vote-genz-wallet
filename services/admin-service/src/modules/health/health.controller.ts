import { Controller, Get } from '@nestjs/common';
import { VoterManagementService } from '../voters/voter-management.service';

@Controller('health')
export class HealthController {
  constructor(private readonly voterManagement: VoterManagementService) {}

  @Get()
  async getHealth() {
    const voterDbOk = await this.voterManagement.checkHealth();

    return {
      status: 'UP',
      service: 'admin-service',
      timestamp: new Date().toISOString(),
      dependencies: {
        voterRegistryWriteDb: voterDbOk ? 'HEALTHY' : 'DEGRADED',
      },
    };
  }
}
