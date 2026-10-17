import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateCandidateDto {
  @IsString()
  @IsNotEmpty()
  electionId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  party: string;

  @IsString()
  @IsNotEmpty()
  symbol: string;

  @IsNumber()
  ballotOrder: number;

  @IsString()
  @IsOptional()
  photoUrl?: string;

  @IsString()
  @IsOptional()
  biography?: string;
}
