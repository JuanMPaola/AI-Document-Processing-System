import type { DocumentItem, ProcessItem } from '../../types/process.types';
import type { Dispatch, SetStateAction } from 'react';

interface Props {
  isOpen: boolean;
  process: ProcessItem | null;
  files: File[];
  setFiles: Dispatch<SetStateAction<File[]>>;
  uploadedDocuments: DocumentItem[];
  step: 'idle' | 'created' | 'uploaded' | 'starting';
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onUpload: () => void;
  onStart: () => void;
  onRemoveUploadedDocument: (documentId: string) => void;
  onRemoveSelectedFile: (fileName: string) => void;
}

export default function CreateProcessModal({
  isOpen,
  process,
  files,
  setFiles,
  uploadedDocuments,
  step,
  loading,
  error,
  onClose,
  onUpload,
  onStart,
  onRemoveSelectedFile,
  onRemoveUploadedDocument,
}: Props) {
  if (!isOpen) return null;

  const canUpload = step === 'created' && files.length > 0 && !loading;
  const canStart =
    step === 'uploaded' && uploadedDocuments.length > 0 && !loading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-300 bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Create Process
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Upload files and start a new analysis process.
            </p>
            {process && (
              <p className="mt-2 font-mono text-xs text-slate-500">
                Process ID: {process.id}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        <div className="space-y-5">
          <div className="rounded-xl border border-slate-300 bg-slate-100 p-4">
            <label className="mb-3 block text-sm font-semibold text-slate-900">
              Select files
            </label>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-blue-300 bg-white px-4 py-8 text-center transition hover:border-blue-400 hover:bg-blue-50">
              <span className="mb-2 text-sm font-medium text-blue-700">
                Click to choose files
              </span>
              <span className="text-xs text-slate-500">
                You can select multiple files
              </span>

              <input
                type="file"
                multiple
                accept=".pdf,.txt,.docx,.png,.jpg,.jpeg,.webp,.bmp,.tiff,.xlsx,.xls"
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
                className="hidden"
              />
            </label>

            <p className="mt-3 text-xs text-slate-500">
              Step 1: Select one or more files. Step 2: Upload them. Step 3:
              Start analysis.
            </p>
          </div>

          {files.length > 0 && (
            <div className="rounded-xl border border-slate-300 bg-slate-50 p-4">
              <h3 className="mb-2 text-sm font-semibold text-slate-900">
                Selected files
              </h3>
              <ul className="max-h-24 overflow-y-auto space-y-2 text-sm text-slate-600">
                {files.map((file) => (
                  <li
                    key={file.name + file.size}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2"
                  >
                    <span>{file.name}</span>

                    <button
                      onClick={() => onRemoveSelectedFile(file.name)}
                      disabled={loading}
                      className="rounded-lg bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {uploadedDocuments.length > 0 && (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4">
              <h3 className="mb-2 text-sm font-semibold text-emerald-800">
                Uploaded files
              </h3>
              <ul className="max-h-24 overflow-y-auto space-y-2 text-sm text-emerald-700">
                {uploadedDocuments.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-white px-3 py-2"
                  >
                    <span>{doc.originalName}</span>

                    <button
                      onClick={() => onRemoveUploadedDocument(doc.id)}
                      disabled={loading}
                      className="rounded-lg bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3">
            {step === 'created' && (
              <button
                onClick={onUpload}
                disabled={!canUpload}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Uploading...' : 'Upload Files'}
              </button>
            )}

            {step === 'uploaded' && (
              <button
                onClick={onStart}
                disabled={!canStart}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Starting...' : 'Start Analysis'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}