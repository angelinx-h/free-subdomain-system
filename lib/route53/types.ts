export type RecordType = 'A' | 'CNAME' | 'MX';

export interface Route53Record {
  name: string;
  type: RecordType;
  ttl: number;
  value: string;
  priority?: number;
}

export interface CreateRecordParams {
  zoneId: string;
  name: string;
  type: RecordType;
  value: string;
  ttl: number;
  priority?: number;
}

export interface UpdateRecordParams extends CreateRecordParams {
  recordId: string;
}

export interface DeleteRecordParams {
  zoneId: string;
  recordId: string;
}

export interface Route53Response {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}
