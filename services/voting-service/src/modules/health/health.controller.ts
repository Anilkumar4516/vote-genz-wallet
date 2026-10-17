import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { RegistryDataSource } from '../../database/registry.datasource';
import { BallotBoxDataSource } from '../../database/ballotbox.datasource';

@Controller('health')
export class HealthController {
  constructor(
    private readonly registryDataSource: RegistryDataSource,
    private readonly ballotBoxDataSource: BallotBoxDataSource,
  ) {}

  @Get('live')
  getLive(@Res() res: Response) {
    return res.status(HttpStatus.OK).json({
      status: 'UP',
      service: 'voting-service',
      probe: 'liveness',
      uptimeSec: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  }

  @Get('ready')
  async getReady(@Res() res: Response) {
    const isRegistryHealthy = await this.registryDataSource.isHealthy();
    const isBallotBoxHealthy = await this.ballotBoxDataSource.isHealthy();

    const isReady = isRegistryHealthy && isBallotBoxHealthy;
    const statusCode = isReady ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;

    return res.status(statusCode).json({
      status: isReady ? 'UP' : 'DEGRADED',
      service: 'voting-service',
      probe: 'readiness',
      dependencies: {
        registryDb: isRegistryHealthy ? 'CONNECTED' : 'DISCONNECTED',
        ballotBoxDb: isBallotBoxHealthy ? 'CONNECTED' : 'DISCONNECTED',
      },
      timestamp: new Date().toISOString(),
    });
  }
}
