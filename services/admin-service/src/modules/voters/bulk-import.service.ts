import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { VoterManagementService, RegisterVoterDto } from './voter-management.service';

export interface BulkImportSummary {
  totalRows: number;
  importedCount: number;
  failedCount: number;
  errors: Array<{ row: number; nationalId?: string; error: string }>;
  durationMs: number;
}

@Injectable()
export class BulkImportService {
  private readonly logger = new Logger(BulkImportService.name);

  constructor(private readonly voterManagement: VoterManagementService) {}

  /**
   * Parses raw CSV string or file content and bulk imports voters into registry
   */
  async importVotersFromCsv(csvContent: string): Promise<BulkImportSummary> {
    const startTime = Date.now();
    const lines = csvContent.split(/\r?\n/).filter((line) => line.trim().length > 0);

    if (lines.length < 2) {
      throw new BadRequestException('CSV file must contain a header and at least one citizen row.');
    }

    const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const expectedHeaders = ['nationalid', 'fullname', 'dateofbirth', 'constituencycode'];

    const hasAllHeaders = expectedHeaders.every((h) => header.includes(h));
    if (!hasAllHeaders) {
      throw new BadRequestException(
        `Invalid CSV header format. Expected columns: ${expectedHeaders.join(', ')}`,
      );
    }

    const nationalIdIdx = header.indexOf('nationalid');
    const fullNameIdx = header.indexOf('fullname');
    const dobIdx = header.indexOf('dateofbirth');
    const constituencyIdx = header.indexOf('constituencycode');

    let importedCount = 0;
    const errors: Array<{ row: number; nationalId?: string; error: string }> = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const cols = line.split(',').map((c) => c.trim());

      const nationalId = cols[nationalIdIdx];
      const fullName = cols[fullNameIdx];
      const dateOfBirth = cols[dobIdx];
      const constituencyCode = cols[constituencyIdx];

      if (!nationalId || !fullName) {
        errors.push({ row: i, nationalId, error: 'Missing nationalId or fullName' });
        continue;
      }

      try {
        const dto: RegisterVoterDto = {
          nationalId,
          fullName,
          dateOfBirth: dateOfBirth || '2000-01-01',
          constituencyCode: constituencyCode || 'CONST-DEFAULT',
        };
        await this.voterManagement.registerVoter(dto);
        importedCount++;
      } catch (err) {
        errors.push({ row: i, nationalId, error: err.message });
      }
    }

    const durationMs = Date.now() - startTime;
    this.logger.log(`📥 Bulk CSV import completed: ${importedCount}/${lines.length - 1} records imported in ${durationMs}ms`);

    return {
      totalRows: lines.length - 1,
      importedCount,
      failedCount: errors.length,
      errors,
      durationMs,
    };
  }
}
