import { useCallback, useEffect, useState } from 'react';
import { getResults } from '../api/analysis.api';
import { getProcessById, getProcessStatus } from '../api/process.api';
import type {
  AnalysisAggregateResults,
  AnalysisDocumentResult,
  ProcessStatusResponse,
} from '../types/analysis.types';
import type { ProcessItem } from '../types/process.types';

export function useProcessDetail(processId?: string) {
  const [process, setProcess] = useState<ProcessItem | null>(null);
  const [status, setStatus] = useState<ProcessStatusResponse | null>(null);
  const [results, setResults] = useState<AnalysisDocumentResult[]>([]);
  const [aggregateResults, setAggregateResults] =
    useState<AnalysisAggregateResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!processId) return;

    try {
      setLoading(true);
      setError(null);

      const [processData, statusData, resultsData] = await Promise.all([
        getProcessById(processId),
        getProcessStatus(processId),
        getResults(processId),
      ]);

      setProcess(processData);
      setStatus(statusData);
      setResults(resultsData.documents ?? []);
      setAggregateResults(resultsData.results ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load process');
    } finally {
      setLoading(false);
    }
  }, [processId]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    process,
    status,
    results,
    aggregateResults,
    loading,
    error,
    reload: load,
    setProcess,
    setStatus,
    setResults,
    setAggregateResults,
  };
}