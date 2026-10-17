import { BaseApiClient, RequestOptions } from '../base-client';
import {
  AdminLoginDto,
  AdminAuthResponse,
  VoterProfile,
  Election,
  ElectionStatus,
  CreateElectionDto,
  Candidate,
  CreateCandidateDto,
  AuditChainVerificationResult,
  AuditLogEntry,
  AppendAuditLogDto,
} from '@vote-wallet/shared-types';

export interface VoterListResponse {
  voters: VoterProfile[];
  total: number;
  page: number;
  limit: number;
}

export interface BulkImportResponse {
  importedCount: number;
  skippedCount: number;
  errors: string[];
}

export class AdminApiClient extends BaseApiClient {
  /**
   * Authenticate administrator or auditor with password and TOTP MFA
   */
  async login(payload: AdminLoginDto, options?: RequestOptions): Promise<AdminAuthResponse> {
    const res = await this.post<AdminAuthResponse>('/admin/auth/login', payload, options);
    if (res?.accessToken) {
      this.setAuthToken(res.accessToken);
    }
    return res;
  }

  /**
   * List registered voters with filtering and pagination
   */
  async getVoters(
    params?: { constituency?: string; page?: number; limit?: number },
    options?: RequestOptions,
  ): Promise<VoterListResponse> {
    return this.get<VoterListResponse>('/admin/voters', {
      ...options,
      params: { ...params, ...options?.params },
    });
  }

  /**
   * Register a single voter
   */
  async createVoter(voter: Partial<VoterProfile>, options?: RequestOptions): Promise<VoterProfile> {
    return this.post<VoterProfile>('/admin/voters', voter, options);
  }

  /**
   * Bulk import registered voters via CSV payload
   */
  async bulkImportVoters(csvContent: string, options?: RequestOptions): Promise<BulkImportResponse> {
    return this.post<BulkImportResponse>('/admin/voters/bulk-import', { csvContent }, options);
  }

  /**
   * Upload voter identity photo
   */
  async uploadPhoto(
    voterId: string,
    photoBase64: string,
    options?: RequestOptions,
  ): Promise<{ photoUrl: string }> {
    return this.post<{ photoUrl: string }>(
      `/admin/voters/${encodeURIComponent(voterId)}/photo`,
      { photoBase64 },
      options,
    );
  }

  /**
   * List all elections
   */
  async getElections(options?: RequestOptions): Promise<Election[]> {
    return this.get<Election[]>('/admin/elections', options);
  }

  /**
   * Create and configure a new national or regional election
   */
  async createElection(payload: CreateElectionDto, options?: RequestOptions): Promise<Election> {
    return this.post<Election>('/admin/elections', payload, options);
  }

  /**
   * Manually or programmatically transition election state (e.g. OPEN, CLOSED, SEALED)
   */
  async updateElectionStatus(
    electionId: string,
    status: ElectionStatus,
    options?: RequestOptions,
  ): Promise<Election> {
    return this.patch<Election>(
      `/admin/elections/${encodeURIComponent(electionId)}/status`,
      { status },
      options,
    );
  }

  /**
   * Nominate a candidate for an election
   */
  async createCandidate(payload: CreateCandidateDto, options?: RequestOptions): Promise<Candidate> {
    return this.post<Candidate>('/admin/candidates', payload, options);
  }

  /**
   * Initiate Shamir 2-of-3 Key Ceremony for an election
   */
  async initiateKeyCeremony(
    electionId: string,
    trusteeIds: string[],
    options?: RequestOptions,
  ): Promise<any> {
    return this.post<any>('/admin/key-ceremony/initiate', { electionId, trusteeIds }, options);
  }

  /**
   * Submit a trustee's key share during key reconstruction
   */
  async submitKeyShare(
    electionId: string,
    trusteeId: string,
    share: string,
    options?: RequestOptions,
  ): Promise<any> {
    return this.post<any>('/admin/key-ceremony/share', { electionId, trusteeId, share }, options);
  }

  /**
   * Validate entire immutable SHA-256 hash-chain from genesis to tip
   */
  async verifyAuditChain(options?: RequestOptions): Promise<AuditChainVerificationResult> {
    return this.get<AuditChainVerificationResult>('/audit/verify-chain', options);
  }

  /**
   * Retrieve full audit chain entries
   */
  async getAuditChain(options?: RequestOptions): Promise<AuditLogEntry[]> {
    return this.get<AuditLogEntry[]>('/audit/chain', options);
  }

  /**
   * Append audit log entry
   */
  async appendAuditLog(payload: AppendAuditLogDto, options?: RequestOptions): Promise<AuditLogEntry> {
    return this.post<AuditLogEntry>('/audit/log', payload, options);
  }
}
