import { useCallback, useEffect, useState } from 'react';
import { getProcesses } from '../api/process.api';
import type { ProcessItem } from '../types/process.types';

export function useProcesses() {
  const [processes, setProcesses] = useState<ProcessItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProcesses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProcesses();
      setProcesses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load processes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProcesses();
  }, [loadProcesses]);

  return {
    processes,
    loading,
    error,
    reload: loadProcesses,
  };
}