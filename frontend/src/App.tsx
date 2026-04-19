import { useEffect, useMemo, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  createProcess,
  getResults,
  pauseAnalysis,
  resumeAnalysis,
  startAnalysis,
  stopAnalysis,
  uploadFiles,
} from './api';

type UploadedDocument = {
  id: string;
  processId: string;
  originalName: string;
  mimeType: string;
  size: number;
  storageKey: string;
  status: string;
  createdAt: string;
};

type AnalysisResult = {
  id: string;
  processId: string;
  documentId: string;
  extractedTextLength: number | string;
  summary: string;
  totalWords: number | string;
  totalLines: number | string;
  totalCharacters: number | string;
  mostFrequentWords: { word: string; count: number }[];
  createdAt: string;
};

type ResultsResponse = {
  processId: string;
  status: string;
  results: AnalysisResult[];
};

type RealtimeEvent = {
  type: string;
  payload: unknown;
};

const SOCKET_URL = 'http://localhost:3000';

function App() {
  const [processId, setProcessId] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [status, setStatus] = useState('IDLE');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({
    processedDocuments: 0,
    totalDocuments: 0,
    percentage: 0,
  });
  const [events, setEvents] = useState<RealtimeEvent[]>([]);

  const socket: Socket | null = useMemo(() => {
    return io(SOCKET_URL, {
      transports: ['websocket'],
    });
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('process.subscribed', (payload) => {
      addEvent('process.subscribed', payload);
    });

    socket.on('process.queued', (payload) => {
      setStatus('PENDING');
      addEvent('process.queued', payload);
    });

    socket.on('process.started', (payload: any) => {
      setStatus('RUNNING');
      setProgress((prev) => ({
        ...prev,
        totalDocuments: payload.totalDocuments ?? prev.totalDocuments,
      }));
      addEvent('process.started', payload);
    });

    socket.on('process.progress', (payload: any) => {
      setProgress({
        processedDocuments: payload.processedDocuments,
        totalDocuments: payload.totalDocuments,
        percentage: payload.percentage,
      });
      addEvent('process.progress', payload);
    });

    socket.on('document.processing', (payload) => {
      addEvent('document.processing', payload);
    });

    socket.on('document.completed', (payload) => {
      addEvent('document.completed', payload);
    });

    socket.on('document.failed', (payload) => {
      addEvent('document.failed', payload);
    });

    socket.on('process.paused', (payload) => {
      setStatus('PAUSED');
      addEvent('process.paused', payload);
    });

    socket.on('process.resumed', (payload) => {
      setStatus('PENDING');
      addEvent('process.resumed', payload);
    });

    socket.on('process.stopped', (payload) => {
      setStatus('STOPPED');
      addEvent('process.stopped', payload);
    });

    socket.on('process.completed', async (payload) => {
      setStatus('COMPLETED');
      addEvent('process.completed', payload);

      if (processId) {
        const data: ResultsResponse = await getResults(processId);
        setResults(data.results);
      }
    });

    socket.on('process.failed', (payload) => {
      setStatus('FAILED');
      addEvent('process.failed', payload);
    });

    return () => {
      socket.disconnect();
    };
  }, [socket, processId]);

  useEffect(() => {
    if (!socket || !processId) return;

    socket.emit('process.subscribe', { processId });

    return () => {
      socket.emit('process.unsubscribe', { processId });
    };
  }, [socket, processId]);

  const addEvent = (type: string, payload: unknown) => {
    setEvents((prev) => [{ type, payload }, ...prev].slice(0, 30));
  };

  const handleCreateProcess = async () => {
    setLoading(true);
    try {
      const res = await createProcess();
      setProcessId(res.id);
      setStatus(res.status ?? 'PENDING');
      setUploadedDocuments([]);
      setResults([]);
      setEvents([]);
      setProgress({
        processedDocuments: 0,
        totalDocuments: 0,
        percentage: 0,
      });
    } catch (error) {
      console.error(error);
      alert('Failed to create process');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!processId || files.length === 0) return;

    setLoading(true);
    try {
      const res = await uploadFiles(processId, files);
      setUploadedDocuments(res.documents);
      setProgress((prev) => ({
        ...prev,
        totalDocuments: res.uploadedCount,
      }));
      alert('Files uploaded successfully');
    } catch (error) {
      console.error(error);
      alert('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    if (!processId || uploadedDocuments.length === 0) {
      alert('Upload files before starting analysis');
      return;
    }

    setLoading(true);
    try {
      const res = await startAnalysis(processId);
      console.log(res);
      setStatus('PENDING');
    } catch (error) {
      console.error(error);
      alert('Failed to start analysis');
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async () => {
    if (!processId) return;
    try {
      await pauseAnalysis(processId);
    } catch (error) {
      console.error(error);
      alert('Failed to pause');
    }
  };

  const handleResume = async () => {
    if (!processId) return;
    try {
      await resumeAnalysis(processId);
    } catch (error) {
      console.error(error);
      alert('Failed to resume');
    }
  };

  const handleStop = async () => {
    if (!processId) return;
    try {
      await stopAnalysis(processId);
    } catch (error) {
      console.error(error);
      alert('Failed to stop');
    }
  };

  const handleRefreshResults = async () => {
    if (!processId) return;
    try {
      const data: ResultsResponse = await getResults(processId);
      setStatus(data.status);
      setResults(data.results);
    } catch (error) {
      console.error(error);
      alert('Failed to fetch results');
    }
  };

  return (
    <div style={{ padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <h1>Document Processing System</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={handleCreateProcess} disabled={loading}>
          Create Process
        </button>
        <button onClick={handleRefreshResults} disabled={!processId}>
          Refresh Results
        </button>
      </div>

      {processId && (
        <>
          <div style={{ marginBottom: 16 }}>
            <strong>Process ID:</strong> {processId}
            <br />
            <strong>Status:</strong> {status}
            <br />
            <strong>Progress:</strong> {progress.percentage}% (
            {progress.processedDocuments}/{progress.totalDocuments})
          </div>

          <div style={{ marginBottom: 16 }}>
            <input
              type="file"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            <button
              onClick={handleUpload}
              disabled={loading || files.length === 0}
            >
              Upload Files
            </button>

            <button
              onClick={handleStart}
              disabled={loading || uploadedDocuments.length === 0}
            >
              Start Analysis
            </button>

            <button onClick={handlePause} disabled={!processId}>
              Pause
            </button>

            <button onClick={handleResume} disabled={!processId}>
              Resume
            </button>

            <button onClick={handleStop} disabled={!processId}>
              Stop
            </button>
          </div>

          <section style={{ marginBottom: 24 }}>
            <h2>Uploaded Documents</h2>
            {uploadedDocuments.length === 0 ? (
              <p>No uploaded documents yet.</p>
            ) : (
              <ul>
                {uploadedDocuments.map((doc) => (
                  <li key={doc.id}>
                    {doc.originalName} — {doc.mimeType}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section style={{ marginBottom: 24 }}>
            <h2>Realtime Events</h2>
            {events.length === 0 ? (
              <p>No events received yet.</p>
            ) : (
              <ul>
                {events.map((event, index) => (
                  <li key={index}>
                    <strong>{event.type}</strong>: {JSON.stringify(event.payload)}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2>Results</h2>
            {results.length === 0 ? (
              <p>No results yet.</p>
            ) : (
              <div style={{ display: 'grid', gap: 16 }}>
                {results.map((result) => (
                  <div
                    key={result.id}
                    style={{
                      border: '1px solid #ccc',
                      padding: 16,
                      borderRadius: 8,
                    }}
                  >
                    <p>
                      <strong>Document ID:</strong> {result.documentId}
                    </p>
                    <p>
                      <strong>Words:</strong> {result.totalWords}
                    </p>
                    <p>
                      <strong>Lines:</strong> {result.totalLines}
                    </p>
                    <p>
                      <strong>Characters:</strong> {result.totalCharacters}
                    </p>
                    <p>
                      <strong>Summary:</strong> {result.summary}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default App;