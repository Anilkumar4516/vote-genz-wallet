import { Injectable, Logger } from '@nestjs/common';
import { CandidateEntity } from '../../database/entities/candidate.entity';
import { CreateCandidateDto } from './dto/create-candidate.dto';

@Injectable()
export class CandidatesService {
  private readonly logger = new Logger(CandidatesService.name);
  private candidates: CandidateEntity[] = [
    {
      id: 'cand-1',
      electionId: 'national-election-2026',
      name: 'Eleanor Vance',
      party: 'Progressive Alliance',
      symbol: '🦅',
      ballotOrder: 1,
      photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      biography: 'Civil liberties and economic equity advocate.',
      createdAt: new Date(),
    },
    {
      id: 'cand-2',
      electionId: 'national-election-2026',
      name: 'Marcus Sterling',
      party: 'Democratic Coalition',
      symbol: '🦁',
      ballotOrder: 2,
      photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
      biography: 'Judicial reform and constitutional protection veteran.',
      createdAt: new Date(),
    },
    {
      id: 'cand-3',
      electionId: 'national-election-2026',
      name: 'Siddharth Roy',
      party: 'Technocratic Union',
      symbol: '⚡',
      ballotOrder: 3,
      photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
      biography: 'Architect of sovereign digital identity and transparent public governance.',
      createdAt: new Date(),
    },
  ];

  async addCandidate(dto: CreateCandidateDto): Promise<CandidateEntity> {
    const candidate: CandidateEntity = {
      id: 'cand-' + Date.now(),
      ...dto,
      createdAt: new Date(),
    };
    this.candidates.push(candidate);
    this.logger.log(`Added candidate [${candidate.name}] to election ${dto.electionId}`);
    return candidate;
  }

  async getCandidatesByElection(electionId: string): Promise<CandidateEntity[]> {
    return this.candidates.filter((c) => c.electionId === electionId);
  }
}
