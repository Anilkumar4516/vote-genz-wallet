import { Injectable } from '@nestjs/common';
import { BallotCastTransaction, BallotCastInput, BallotCastResult } from './ballot-cast.transaction';

@Injectable()
export class BallotService {
  constructor(private readonly castTransaction: BallotCastTransaction) {}

  async castVote(input: BallotCastInput): Promise<BallotCastResult> {
    return this.castTransaction.execute(input);
  }
}
