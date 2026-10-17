import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ElectionEntity, ElectionState } from '../../database/entities/election.entity';
import { CreateElectionDto } from './dto/create-election.dto';

@Injectable()
export class ElectionsService {
  private readonly logger = new Logger(ElectionsService.name);
  private elections: Map<string, ElectionEntity> = new Map([
    [
      'national-election-2026',
      {
        id: 'national-election-2026',
        title: '2026 Presidential & Parliamentary General Election',
        description: 'National general election for citizen representatives',
        state: 'OPEN',
        startTime: new Date('2026-10-17T06:00:00Z'),
        endTime: new Date('2026-10-18T18:00:00Z'),
        candidateIds: ['cand-1', 'cand-2', 'cand-3'],
        totalEligibleVoters: 1000000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  ]);

  async createElection(dto: CreateElectionDto): Promise<ElectionEntity> {
    const id = 'elec-' + Date.now();
    const election: ElectionEntity = {
      id,
      title: dto.title,
      description: dto.description,
      state: 'SCHEDULED',
      startTime: new Date(dto.startTime),
      endTime: new Date(dto.endTime),
      candidateIds: dto.candidates.map((_, idx) => `cand-${idx + 1}`),
      totalEligibleVoters: 500000,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.elections.set(id, election);
    this.logger.log(`Created new election [${id}] - ${dto.title}`);
    return election;
  }

  async setElectionState(electionId: string, state: ElectionState): Promise<ElectionEntity> {
    const election = this.elections.get(electionId);
    if (!election) {
      throw new NotFoundException(`Election ${electionId} not found`);
    }

    election.state = state;
    election.updatedAt = new Date();
    this.logger.log(`Electoral state transition for [${electionId}]: -> ${state}`);
    return election;
  }

  async getElection(electionId: string): Promise<ElectionEntity> {
    const election = this.elections.get(electionId);
    if (!election) {
      throw new NotFoundException(`Election ${electionId} not found`);
    }
    return election;
  }

  async getAllElections(): Promise<ElectionEntity[]> {
    return Array.from(this.elections.values());
  }
}
