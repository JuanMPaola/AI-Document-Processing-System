export type ProcessStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'PAUSED'
  | 'COMPLETED'
  | 'FAILED'
  | 'STOPPED';

export interface DocumentItem {
  id: string;
  processId: string;
  originalName: string;
  mimeType: string;
  size: number;
  storageKey: string;
  status: string;
  createdAt: string;
}

export interface ProcessItem {
  id: string;
  status: ProcessStatus;
  createdAt: string;
  updatedAt: string;
  documents?: DocumentItem[];
}