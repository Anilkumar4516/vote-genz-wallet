import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../../src/components/StatusBadge';

describe('StatusBadge Component', () => {
  it('renders OPEN status with emerald styling', () => {
    render(<StatusBadge status="OPEN" />);
    const badge = screen.getByText('OPEN');
    expect(badge).toBeInTheDocument();
    expect(badge.closest('span')).toHaveClass('text-emerald-400');
  });

  it('renders CLOSED status with sky styling', () => {
    render(<StatusBadge status="CLOSED" />);
    const badge = screen.getByText('CLOSED');
    expect(badge).toBeInTheDocument();
    expect(badge.closest('span')).toHaveClass('text-sky-400');
  });

  it('renders SEALED status with indigo styling', () => {
    render(<StatusBadge status="SEALED" />);
    const badge = screen.getByText('SEALED');
    expect(badge).toBeInTheDocument();
    expect(badge.closest('span')).toHaveClass('text-indigo-400');
  });
});
