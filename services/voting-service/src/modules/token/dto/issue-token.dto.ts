import { IsNotEmpty, IsString } from 'class-validator';

export class IssueTokenDto {
  @IsString()
  @IsNotEmpty({ message: 'electionId is required' })
  electionId: string;

  @IsString()
  @IsNotEmpty({ message: 'voterHash is required' })
  voterHash: string;
}
