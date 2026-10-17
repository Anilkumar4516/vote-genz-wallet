import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CandidateCard } from '../../src/components/voting/CandidateCard';
import { Candidate } from '@vote-wallet/shared-types';

describe('CandidateCard Component', () => {
  const mockCandidate: Candidate = {
    id: 'cand_test_01',
    electionId: 'elec_test',
    fullName: 'Rajesh Kumar Singh',
    partyName: 'National Democratic Coalition',
    ballotNumber: 1,
    biography: 'Experienced civil administrator focused on renewable infrastructure.',
  };

  it('renders candidate details and ballot number correctly', () => {
    render(
      <CandidateCard
        candidate={mockCandidate}
        isSelected={false}
        onSelect={jest.fn()}
      />,
    );

    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('Rajesh Kumar Singh')).toBeInTheDocument();
    expect(screen.getByText('National Democratic Coalition')).toBeInTheDocument();
  });

  it('triggers onSelect when card is clicked', () => {
    const handleSelect = jest.fn();
    render(
      <CandidateCard
        candidate={mockCandidate}
        isSelected={false}
        onSelect={handleSelect}
      />,
    );

    fireEvent.click(screen.getByRole('radio'));
    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith(mockCandidate);
  });

  it('displays glowing selected styling when isSelected is true', () => {
    render(
      <CandidateCard
        candidate={mockCandidate}
        isSelected={true}
        onSelect={jest.fn()}
      />,
    );

    const card = screen.getByRole('radio');
    expect(card).toHaveAttribute('aria-checked', 'true');
    expect(card).toHaveClass('border-cyan-400');
  });
});
