'use client';

import { useState, useEffect } from 'react';
import { Candidate } from '@vote-wallet/shared-types';
import { apiClient } from '../../lib/api/client';
import { useVoteFlowStore } from '../../store/vote-flow.store';

export function useCandidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { electionId } = useVoteFlowStore();

  useEffect(() => {
    let isMounted = true;

    async function loadCandidates() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await apiClient.voting.getCandidates(electionId);
        if (isMounted) {
          if (data && data.length > 0) {
            setCandidates(data);
          } else {
            // Default sample candidate slate
            setCandidates(getSampleCandidates());
          }
        }
      } catch {
        if (isMounted) {
          setCandidates(getSampleCandidates());
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadCandidates();

    return () => {
      isMounted = false;
    };
  }, [electionId]);

  return { candidates, isLoading, error };
}

function getSampleCandidates(): Candidate[] {
  return [
    {
      id: 'cand_01',
      electionId: 'elec_2026_national_general',
      fullName: 'Aarav Rajesh Verma',
      partyName: 'National Democratic Progressive Coalition',
      ballotNumber: 1,
      biography: 'Focusing on clean energy expansion, digital education, and healthcare digitization.',
    },
    {
      id: 'cand_02',
      electionId: 'elec_2026_national_general',
      fullName: 'Priya Sundaram Naidu',
      partyName: 'United Citizens People\'s Party',
      ballotNumber: 2,
      biography: 'Championing rural water infrastructure, urban transit modernization, and youth employment.',
    },
    {
      id: 'cand_03',
      electionId: 'elec_2026_national_general',
      fullName: 'Vikramaditya Sengupta',
      partyName: 'Democratic Secular Alliance',
      ballotNumber: 3,
      biography: 'Dedicated to transparency in public procurement, agricultural reform, and small business tax relief.',
    },
    {
      id: 'cand_04',
      electionId: 'elec_2026_national_general',
      fullName: 'Dr. Fatima Zahra Qureshi',
      partyName: 'Social Justice & Green Congress',
      ballotNumber: 4,
      biography: 'Public health physician advocating for universal health insurance and carbon neutrality.',
    },
    {
      id: 'cand_05',
      electionId: 'elec_2026_national_general',
      fullName: 'None of the Above (NOTA)',
      partyName: 'Electoral Disapproval Option',
      ballotNumber: 5,
      biography: 'Record official vote of dissent without choosing any listed candidate.',
    },
  ];
}
