export interface AuditLogEntity {
  id: string;
  action: string;
  actor: string;
  details: Record<string, any>;
  previousHash: string;
  currentHash: string;
  timestamp: Date;
}
