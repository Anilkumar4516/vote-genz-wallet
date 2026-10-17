import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProgressSteps } from '../../src/components/verification/ProgressSteps';

describe('ProgressSteps Component', () => {
  it('renders all five voting journey milestones', () => {
    render(<ProgressSteps currentStep="LOGIN" />);

    expect(screen.getByText('1. Auth')).toBeInTheDocument();
    expect(screen.getByText('2. Identity')).toBeInTheDocument();
    expect(screen.getByText('3. Verify')).toBeInTheDocument();
    expect(screen.getByText('4. Ballot')).toBeInTheDocument();
    expect(screen.getByText('5. Receipt')).toBeInTheDocument();
  });

  it('correctly marks previous steps as completed when on BALLOT', () => {
    const { container } = render(<ProgressSteps currentStep="BALLOT" />);

    // Steps 1 (Auth), 2 (Identity), and 3 (Verify) should have completed status
    expect(screen.getByText('4. Ballot')).toHaveClass('text-cyan-400');
    expect(screen.getByText('1. Auth')).toHaveClass('text-emerald-400');
  });

  it('marks Receipt as active when currentStep is RECEIPT', () => {
    render(<ProgressSteps currentStep="RECEIPT" />);
    expect(screen.getByText('5. Receipt')).toHaveClass('text-cyan-400');
  });
});
