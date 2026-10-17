import { BaseApiClient, RequestOptions } from '../base-client';
import {
  FaceChallengeResponse,
  FaceVerifyRequest,
  FaceVerifyResponse,
} from '@vote-wallet/shared-types';

export class FaceApiClient extends BaseApiClient {
  /**
   * Request dynamic interactive liveness challenge (e.g. BLINK, HEAD_TURN)
   */
  async getChallenge(nationalId: string, options?: RequestOptions): Promise<FaceChallengeResponse> {
    return this.post<FaceChallengeResponse>(
      `/verify/challenge?nationalId=${encodeURIComponent(nationalId)}`,
      undefined,
      options,
    );
  }

  /**
   * Submit live facial capture and challenge actions for ArcFace match
   */
  async verifyFace(
    payload: FaceVerifyRequest,
    options?: RequestOptions,
  ): Promise<FaceVerifyResponse> {
    return this.post<FaceVerifyResponse>('/verify/face', payload, options);
  }

  /**
   * Health check for face recognition inference engine
   */
  async checkHealth(options?: RequestOptions): Promise<{ status: string; engine: string }> {
    return this.get<{ status: string; engine: string }>('/health', options);
  }
}
