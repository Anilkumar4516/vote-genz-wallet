import { IsNotEmpty, IsString } from 'class-validator';

export class CastVoteDto {
  @IsString()
  @IsNotEmpty({ message: 'votingToken is required' })
  votingToken: string;

  @IsString()
  @IsNotEmpty({ message: 'electionId is required' })
  electionId: string;

  @IsString()
  @IsNotEmpty({ message: 'candidateId is required' })
  candidateId: string;
}
