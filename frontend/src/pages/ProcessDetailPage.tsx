import { useParams, Link } from 'react-router-dom';
import {
  pauseAnalysis,
  resumeAnalysis,
  startAnalysis,
  stopAnalysis,
} from '../api/analysis.api';
import DocumentResultCard from '../components/analysis/DocummentResultCard';
import ProgressBar from '../components/analysis/ProgressBar';
import RealtimeEventsPanel from '../components/analysis/RealTimeEventsPanel';
import ResultsSummary from '../components/analysis/ResultsSummary';
import ProcessStatusBadge from '../components/process/ProcessStatusBadge';
import { useProcessDetail } from '../hooks/useProcessDetail';
import { useProcessSocket } from '../hooks/useProcessSocket';

export default function ProcessDetailPage() {
  const { id } = useParams();

  const {
    process,
    status,
    results,
    aggregateResults,
    loading,
    error,
    reload,
    setResults,
    setStatus,
  } = useProcessDetail(id);

  const { events } = useProcessSocket({
    processId: id,
    setStatus,
    setResults,
    reload,
  });

  const handleStart = async () => {
    if (!id) return;
    await startAnalysis(id);
  };

  const handlePause = async () => {
    if (!id) return;
    await pauseAnalysis(id);
  };

  const handleResume = async () => {
    if (!id) return;
    await resumeAnalysis(id);
  };

  const handleStop = async () => {
    if (!id) return;
    await stopAnalysis(id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <p className="text-sm text-slate-500">Loading process...</p>
        </div>
      </div>
    );
  }

  if (error || !process || !status) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <p className="text-sm text-red-700">
              {error ?? 'Process not found'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentStatus = status.status || process.status;

  const canStart = currentStatus === 'PENDING';
  const canPause = currentStatus === 'RUNNING';
  const canResume = currentStatus === 'PAUSED';
  const canStop = currentStatus === 'RUNNING' || currentStatus === 'PAUSED';

  return (
    <div className="min-h-screen bg-slate-200">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link
              to="/"
              className="mb-3 inline-block text-sm text-blue-600 hover:text-blue-700"
            >
              ← Back to processes
            </Link>

            <h1 className="text-3xl font-bold text-slate-900">
              Process Detail
            </h1>

            <p className="mt-2 font-mono text-xs text-slate-500">{process.id}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ProcessStatusBadge status={currentStatus as any} />

            <button
              onClick={reload}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Refresh
            </button>

            <button
              onClick={handleStart}
              disabled={!canStart}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Start
            </button>

            <button
              onClick={handlePause}
              disabled={!canPause}
              className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Pause
            </button>

            <button
              onClick={handleResume}
              disabled={!canResume}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Resume
            </button>

            <button
              onClick={handleStop}
              disabled={!canStop}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Stop
            </button>
          </div>
        </div>

        <div className="mb-8 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Process Progress
            </h2>

            <ProgressBar
              percentage={status.progress.percentage}
              isRunning={currentStatus === 'RUNNING'}
              isCompleted={currentStatus === 'COMPLETED'}
            />

            <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
              <div>
                <p className="text-xs text-slate-500">Processed Files</p>
                <p className="font-semibold text-slate-900">
                  {status.progress.processed_files}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Total Files</p>
                <p className="font-semibold text-slate-900">
                  {status.progress.total_files}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Started At</p>
                <p className="font-semibold text-slate-900">
                  {status.started_at
                    ? new Date(status.started_at).toLocaleString()
                    : '-'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Uploaded Documents
            </h2>

            {process.documents?.length ? (
              <ul className="space-y-2 text-sm text-slate-700">
                {process.documents.map((doc) => (
                  <li
                    key={doc.id}
                    className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
                  >
                    <div className="font-medium">{doc.originalName}</div>
                    <div className="text-xs text-slate-500">{doc.mimeType}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No documents uploaded.</p>
            )}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Results Summary
          </h2>
          <ResultsSummary results={aggregateResults} />
        </div>

        <div className="mb-8">
          <RealtimeEventsPanel events={events} />
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Document Results
          </h2>

          {results.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
              No analysis results yet.
            </div>
          ) : (
            <div className="grid gap-4">
              {results.map((result) => (
                <DocumentResultCard
                  key={result.document_id}
                  result={result}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}