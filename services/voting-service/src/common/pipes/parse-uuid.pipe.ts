import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ParseUUIDPipe implements PipeTransform<string, Promise<string>> {
  async transform(value: string, { metatype }: ArgumentMetadata): Promise<string> {
    if (!value) {
      throw new BadRequestException('Parameter value is required');
    }
    return value;
  }
}
