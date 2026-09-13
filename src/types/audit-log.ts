export interface AuditLogEntry {
  id: string;
  entity: string;
  entityId: string;
  action: string;
  beforeValue?: unknown;
  afterValue?: unknown;
  adminId?: string;
  createdAt: string;
  propertyId?: string;
}

export interface AuditLogListParams {
  entity?: string;
  entityId?: string;
  propertyId?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}
