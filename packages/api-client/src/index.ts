import { BaseApiClient, RequestOptions } from './base-client';
import { AuthApiClient } from './services/auth-api';
import { VotingApiClient } from './services/voting-api';
import { AdminApiClient } from './services/admin-api';
import { FaceApiClient } from './services/face-api';

export * from './base-client';
export * from './services/auth-api';
export * from './services/voting-api';
export * from './services/admin-api';
export * from './services/face-api';

export interface VoteWalletClientConfig {
  /** Gateway base URL (if microservices are behind reverse proxy / API gateway) */
  gatewayUrl?: string;
  /** Service-specific URLs if directly accessing microservice ports */
  services?: {
    auth?: string;
    voting?: string;
    admin?: string;
    face?: string;
  };
  authToken?: string;
  timeoutMs?: number;
  customFetch?: typeof fetch;
}

/**
 * VoteWalletClient
 *
 * Consolidated, type-safe API client for Vote Wallet web applications,
 * voter portals, and administrative oversight consoles.
 */
export class VoteWalletClient {
  public readonly auth: AuthApiClient;
  public readonly voting: VotingApiClient;
  public readonly admin: AdminApiClient;
  public readonly face: FaceApiClient;

  constructor(config: VoteWalletClientConfig = {}) {
    const defaultGateway = config.gatewayUrl || '';

    const authUrl = config.services?.auth || defaultGateway;
    const votingUrl = config.services?.voting || defaultGateway;
    const adminUrl = config.services?.admin || defaultGateway;
    const faceUrl = config.services?.face || defaultGateway;

    this.auth = new AuthApiClient({
      baseUrl: authUrl,
      authToken: config.authToken,
      timeoutMs: config.timeoutMs,
      customFetch: config.customFetch,
    });

    this.voting = new VotingApiClient({
      baseUrl: votingUrl,
      authToken: config.authToken,
      timeoutMs: config.timeoutMs,
      customFetch: config.customFetch,
    });

    this.admin = new AdminApiClient({
      baseUrl: adminUrl,
      authToken: config.authToken,
      timeoutMs: config.timeoutMs,
      customFetch: config.customFetch,
    });

    this.face = new FaceApiClient({
      baseUrl: faceUrl,
      authToken: config.authToken,
      timeoutMs: config.timeoutMs,
      customFetch: config.customFetch,
    });
  }

  /**
   * Set Bearer authentication token across all service sub-clients
   */
  setAuthToken(token: string | undefined): void {
    this.auth.setAuthToken(token);
    this.voting.setAuthToken(token);
    this.admin.setAuthToken(token);
    this.face.setAuthToken(token);
  }

  /**
   * Clear active authentication token across all clients
   */
  clearAuthToken(): void {
    this.setAuthToken(undefined);
  }
}

/**
 * Factory helper to instantiate VoteWalletClient
 */
export function createVoteWalletClient(config: VoteWalletClientConfig = {}): VoteWalletClient {
  return new VoteWalletClient(config);
}
