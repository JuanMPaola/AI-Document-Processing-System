import type { AnalysisResultsResponse } from '../types/analysis.types';

const API_URL = 'http://localhost:3000';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Request failed');
  }

  return res.json();
}

export async function startAnalysis(processId: string) {
  const res = await fetch(`${API_URL}/process/${processId}/start`, {
    method: 'POST',
  });

  return handleResponse<{
    queued: boolean;
    processId: string;
    jobId: string;
  }>(res);
}

export async function pauseAnalysis(processId: string) {
  const res = await fetch(`${API_URL}/process/${processId}/pause`, {
    method: 'POST',
  });

  return handleResponse<{
    processId: string;
    status: string;
    message: string;
  }>(res);
}

export async function resumeAnalysis(processId: string) {
  const res = await fetch(`${API_URL}/process/${processId}/resume`, {
    method: 'POST',
  });

  return handleResponse<{
    processId: string;
    status: string;
    message: string;
  }>(res);
}

export async function stopAnalysis(processId: string) {
  const res = await fetch(`${API_URL}/process/${processId}/stop`, {
    method: 'POST',
  });

  return handleResponse<{
    processId: string;
    status: string;
    message: string;
  }>(res);
}

export async function getResults(
  processId: string,
): Promise<AnalysisResultsResponse> {
  const res = await fetch(`${API_URL}/process/${processId}/results`);
  return handleResponse<AnalysisResultsResponse>(res);
}