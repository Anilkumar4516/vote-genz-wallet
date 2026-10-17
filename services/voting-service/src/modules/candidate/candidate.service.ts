import { Injectable } from '@nestjs/common';

export interface Candidate {
  id: string;
  name: string;
  party: string;
  symbol: string;
  bio: string;
}

@Injectable()
export class CandidateService {
  private candidatesByElection: Map<string, Candidate[]> = new Map([
    [
      'national-election-2026',
      [
        {
          id: 'cand-1',
          name: 'Eleanor Vance',
          party: 'Progressive Alliance',
          symbol: '🦅',
          bio: 'Champion of clean energy, universal digital access, and transparent governance.',
        },
        {
          id: 'cand-2',
          name: 'Marcus Sterling',
          party: 'Democratic Coalition',
          symbol: '🦁',
          bio: 'Advocating constitutional protection, fiscal resilience, and education infrastructure.',
        },
        {
          id: 'cand-3',
          name: 'Siddharth Roy',
          party: 'Technocratic Union',
          symbol: '⚡',
          bio: 'Pioneering open-source public digital infrastructure and AI accountability frameworks.',
        },
      ],
    ],
  ]);

  async getCandidatesByElectionId(electionId: string): Promise<Candidate[]> {
    return (
      this.candidatesByElection.get(electionId) || [
        {
          id: 'cand-1',
          name: 'Eleanor Vance',
          party: 'Progressive Alliance',
          symbol: '🦅',
          bio: 'Candidate 1 profile',
        },
        {
          id: 'cand-2',
          name: 'Marcus Sterling',
          party: 'Democratic Coalition',
          symbol: '🦁',
          bio: 'Candidate 2 profile',
        },
      ]
    );
  }
}
