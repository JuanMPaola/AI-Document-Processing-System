import { useNavigate } from 'react-router-dom';
import CreateProcessModal from '../components/process/CreateProcessModal';
import ProcessGrid from '../components/process/ProcessGrid';
import { useCreateProcessFlow } from '../hooks/useCreateProcessFlow';
import { useProcesses } from '../hooks/useProcesses';

export default function HomePage() {
  const navigate = useNavigate();
  const { processes, loading, error, reload } = useProcesses();
  const createFlow = useCreateProcessFlow();

  const handleStartAnalysis = async () => {
    const processId = await createFlow.start();

    if (processId) {
      createFlow.close();
      reload();
      navigate(`/process/${processId}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-200">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Document Processing System
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              View and manage document analysis processes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={reload}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Refresh
            </button>

            <button
              onClick={createFlow.open}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Create Process
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Loading processes...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        ) : (
          <ProcessGrid processes={processes} />
        )}

        <CreateProcessModal
          isOpen={createFlow.isOpen}
          process={createFlow.process}
          files={createFlow.files}
          setFiles={createFlow.setFiles}
          uploadedDocuments={createFlow.uploadedDocuments}
          step={createFlow.step}
          loading={createFlow.loading}
          error={createFlow.error}
          onClose={createFlow.close}
          onUpload={createFlow.upload}
          onStart={handleStartAnalysis}
        />
      </div>
    </div>
  );
}