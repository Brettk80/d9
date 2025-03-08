export interface FaxRecipient {
  faxNumber: string;
  toHeader?: string;
  [key: string]: any;
}

export interface ListInfo {
  id: string;
  fileName: string;
  recipientCount: number;
  mapping: {
    faxNumber: string;
    toHeader?: string;
  };
  hasInternational?: boolean;
}

export interface FaxDocument {
  id: string;
  fileName: string;
  fileSize: number;
  pageCount: number;
  previewUrl?: string;
  status?: 'processing' | 'ready' | 'error';
  errorMessage?: string;
}

export interface ScheduleOptions {
  sendImmediately: boolean;
  scheduledDate?: Date;
  scheduledTime?: string;
  timeZone?: string;
}

export interface TestFaxInfo {
  faxNumber: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  sentAt?: Date;
  deliveredAt?: Date;
  errorMessage?: string;
}

export interface BroadcastInfo {
  id: string;
  name: string;
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed' | 'paused';
  documentCount: number;
  recipientCount: number;
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  createdAt: Date;
  scheduledFor?: Date;
  completedAt?: Date;
  testFax?: TestFaxInfo;
}
