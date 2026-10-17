import React from 'react';
import { render, screen } from '@testing-library/react';
import { RoleGate } from '../../src/components/RoleGate';
import { useAdminAuthStore } from '../../src/store/admin-auth.store';

// Mock Zustand store
jest.mock('../../src/store/admin-auth.store');

describe('RoleGate Component', () => {
  it('renders children when official has permission', () => {
    (useAdminAuthStore as unknown as jest.Mock).mockReturnValue({
      user: { role: 'AUDITOR', name: 'Test Auditor' },
      hasPermission: (perm: string) => perm === 'VERIFY_AUDIT_CHAIN',
    });

    render(
      <RoleGate permission="VERIFY_AUDIT_CHAIN">
        <button>Run Chain Verification</button>
      </RoleGate>,
    );

    expect(screen.getByText('Run Chain Verification')).toBeInTheDocument();
  });

  it('hides children when official lacks required permission', () => {
    (useAdminAuthStore as unknown as jest.Mock).mockReturnValue({
      user: { role: 'OPERATOR', name: 'Test Operator' },
      hasPermission: (perm: string) => perm === 'REGISTER_VOTERS',
    });

    render(
      <RoleGate permission="VERIFY_AUDIT_CHAIN">
        <button>Run Chain Verification</button>
      </RoleGate>,
    );

    expect(screen.queryByText('Run Chain Verification')).not.toBeInTheDocument();
  });
});
