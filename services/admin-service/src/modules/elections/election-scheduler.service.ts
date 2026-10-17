import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ElectionsService } from './elections.service';
import { AuditWriterService } from '../audit/audit-writer.service';

@Injectable()
export class ElectionSchedulerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ElectionSchedulerService.name);
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private readonly electionsService: ElectionsService,
    private readonly auditWriter: AuditWriterService,
  ) {}

  onModuleInit() {
    this.logger.log('Starting automated election lifecycle scheduler (evaluates every 30s)');
    this.timer = setInterval(() => this.evaluateElections(), 30000);
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  /**
   * Automatically opens scheduled elections and closes expired elections based on set timestamps
   */
  async evaluateElections(): Promise<void> {
    const elections = await this.electionsService.getAllElections();
    const now = new Date();

    for (const election of elections) {
      // Auto OPEN
      if (election.state === 'SCHEDULED' && now >= election.startTime && now < election.endTime) {
        this.logger.log(`⏰ [Auto Scheduler] Scheduled polling window commenced for election ${election.id}. State -> OPEN`);
        await this.electionsService.setElectionState(election.id, 'OPEN');
        await this.auditWriter.appendLog('AUTO_OPEN_ELECTION', 'SYSTEM_SCHEDULER', {
          electionId: election.id,
          startTime: election.startTime,
        });
      }

      // Auto CLOSE
      if (election.state === 'OPEN' && now >= election.endTime) {
        this.logger.log(`⏰ [Auto Scheduler] Scheduled polling window expired for election ${election.id}. State -> CLOSED`);
        await this.electionsService.setElectionState(election.id, 'CLOSED');
        await this.auditWriter.appendLog('AUTO_CLOSE_ELECTION', 'SYSTEM_SCHEDULER', {
          electionId: election.id,
          endTime: election.endTime,
        });
      }
    }
  }
}
