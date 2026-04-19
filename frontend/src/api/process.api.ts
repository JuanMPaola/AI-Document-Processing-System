import type { ProcessItem } from '../types/process.types';
import type { ProcessStatusResponse } from '../types/analysis.types';

const API_URL = 'http://localhost:3000';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Request failed');
  }

  return res.json();
}

export async function getProcesses(): Promise<ProcessItem[]> {
  const res = await fetch(`${API_URL}/process`);
  return handleResponse<ProcessItem[]>(res);
}

export async function getProcessById(id: string): Promise<ProcessItem> {
  const res = await fetch(`${API_URL}/process/${id}`);
  return handleResponse<ProcessItem>(res);
}

export async function createProcess(): Promise<ProcessItem> {
  const res = await fetch(`${API_URL}/process`, {
    method: 'POST',
  });

  return handleResponse<ProcessItem>(res);
}

export async function getProcessStatus(
  processId: string,
): Promise<ProcessStatusResponse> {
  const res = await fetch(`${API_URL}/process/${processId}/status`);
  return handleResponse<ProcessStatusResponse>(res);
}