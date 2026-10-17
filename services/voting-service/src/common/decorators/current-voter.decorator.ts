import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentVoterPayload {
  voterHash: string;
  verifiedFactors: {
    otp: boolean;
    face: boolean;
    fingerprint: boolean;
  };
}

export const CurrentVoter = createParamDecorator(
  (data: keyof CurrentVoterPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const voter = request.user || {
      voterHash: request.headers['x-voter-hash'] || 'vh-anonymous-test-hash',
      verifiedFactors: {
        otp: request.headers['x-otp-verified'] === 'true',
        face: request.headers['x-face-verified'] === 'true',
        fingerprint: request.headers['x-fingerprint-verified'] === 'true',
      },
    };

    return data ? voter[data] : voter;
  },
);
