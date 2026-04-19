import { useEffect, useState } from 'react';
import { socket } from '../api/socket';
import type {
  AnalysisDocumentResult,
  ProcessStatusResponse,
} from '../types/analysis.types';

type ProcessEvent =
  | { type: 'process.queued'; payload: any }
  | { type: 'process.started'; payload: any }
  | { type: 'process.progress'; payload: any }
  | { type: 'process.completed'; payload: any }
  | { type: 'process.failed'; payload: any }
  | { type: 'process.paused'; payload: any }
  | { type: 'process.resumed'; payload: any }
  | { type: 'process.stopped'; payload: any }
  | { type: 'document.processing'; payload: any }
  | { type: 'document.completed'; payload: any }
  | { type: 'document.failed'; payload: any };

interface Params {
  processId?: string;
  setStatus: React.Dispatch<React.SetStateAction<ProcessStatusResponse | null>>;
  setResults: React.Dispatch<React.SetStateAction<AnalysisDocumentResult[]>>;
  reload: () => Promise<void>;
}

export function useProcessSocket({
  processId,
  setStatus,
  setResults,
  reload,
}: Params) {
  const [events, setEvents] = useState<ProcessEvent[]>([]);

  useEffect(() => {
    if (!processId) return;

    const addEvent = (type: ProcessEvent['type'], payload: any) => {
      setEvents((prev) => [{ type, payload }, ...prev].slice(0, 30));
    };

    socket.emit('process.subscribe', { processId });

    const onQueued = (payload: any) => {
      addEvent('process.queued', payload);
      setStatus((prev) =>
        prev
          ? {
              ...prev,
              status: payload.status ?? prev.status,
            }
          : prev,
      );
    };

    const onStarted = (payload: any) => {
      addEvent('process.started', payload);
      setStatus((prev) =>
        prev
          ? {
              ...prev,
              status: payload.status ?? prev.status,
              progress: {
                ...prev.progress,
                total_files: payload.totalDocuments ?? prev.progress.total_files,
              },
            }
          : prev,
      );
    };

    const onProgress = (payload: any) => {
      addEvent('process.progress', payload);
      setStatus((prev) =>
        prev
          ? {
              ...prev,
              progress: {
                total_files: payload.totalDocuments ?? prev.progress.total_files,
                processed_files:
                  payload.processedDocuments ?? prev.progress.processed_files,
                percentage: payload.percentage ?? prev.progress.percentage,
              },
            }
          : prev,
      );
    };

    const onCompleted = async (payload: any) => {
      addEvent('process.completed', payload);
      setStatus((prev) =>
        prev
          ? {
              ...prev,
              status: payload.status ?? 'COMPLETED',
              progress: {
                ...prev.progress,
                processed_files:
                  payload.processedDocuments ?? prev.progress.processed_files,
                percentage: 100,
              },
            }
          : prev,
      );

      await reload();
    };

    const onFailed = (payload: any) => {
      addEvent('process.failed', payload);
      setStatus((prev) =>
        prev
          ? {
              ...prev,
              status: payload.status ?? 'FAILED',
            }
          : prev,
      );
    };

    const onPaused = (payload: any) => {
      addEvent('process.paused', payload);
      setStatus((prev) =>
        prev
          ? {
              ...prev,
              status: payload.status ?? 'PAUSED',
            }
          : prev,
      );
    };

    const onResumed = (payload: any) => {
      addEvent('process.resumed', payload);
      setStatus((prev) =>
        prev
          ? {
              ...prev,
              status: payload.status ?? 'PENDING',
            }
          : prev,
      );
    };

    const onStopped = (payload: any) => {
      addEvent('process.stopped', payload);
      setStatus((prev) =>
        prev
          ? {
              ...prev,
              status: payload.status ?? 'STOPPED',
            }
          : prev,
      );
    };

    const onDocumentProcessing = (payload: any) => {
      addEvent('document.processing', payload);
    };

    const onDocumentCompleted = (payload: any) => {
      addEvent('document.completed', payload);
    };

    const onDocumentFailed = (payload: any) => {
      addEvent('document.failed', payload);
    };

    socket.on('process.queued', onQueued);
    socket.on('process.started', onStarted);
    socket.on('process.progress', onProgress);
    socket.on('process.completed', onCompleted);
    socket.on('process.failed', onFailed);
    socket.on('process.paused', onPaused);
    socket.on('process.resumed', onResumed);
    socket.on('process.stopped', onStopped);
    socket.on('document.processing', onDocumentProcessing);
    socket.on('document.completed', onDocumentCompleted);
    socket.on('document.failed', onDocumentFailed);

    return () => {
      socket.emit('process.unsubscribe', { processId });

      socket.off('process.queued', onQueued);
      socket.off('process.started', onStarted);
      socket.off('process.progress', onProgress);
      socket.off('process.completed', onCompleted);
      socket.off('process.failed', onFailed);
      socket.off('process.paused', onPaused);
      socket.off('process.resumed', onResumed);
      socket.off('process.stopped', onStopped);
      socket.off('document.processing', onDocumentProcessing);
      socket.off('document.completed', onDocumentCompleted);
      socket.off('document.failed', onDocumentFailed);
    };
  }, [processId, reload, setResults, setStatus]);

  return {
    events,
  };
}