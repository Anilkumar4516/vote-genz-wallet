import { IsNotEmpty, IsString, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CandidateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  party: string;

  @IsString()
  @IsNotEmpty()
  symbol: string;
}

export class CreateElectionDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  description: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CandidateDto)
  candidates: CandidateDto[];
}
