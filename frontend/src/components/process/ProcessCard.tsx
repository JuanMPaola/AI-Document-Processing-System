import { Link } from 'react-router-dom';
import type { ProcessItem } from '../../types/process.types';
import ProcessStatusBadge from './ProcessStatusBadge';

interface Props {
  process: ProcessItem;
}

export default function ProcessCard({ process }: Props) {
  const documentCount = process.documents?.length ?? 0;

  return (
    <Link
      to={`/process/${process.id}`}
      className="block rounded-2xl border border-slate-300 bg-white p-5 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Process</h3>
          <p className="mt-1 font-mono text-xs text-slate-500">{process.id}</p>
        </div>

        <ProcessStatusBadge status={process.status} />
      </div>

      <div className="space-y-2 text-sm text-slate-600">
        <p>
          <span className="font-medium text-slate-800">Documents:</span>{' '}
          {documentCount}
        </p>
        <p>
          <span className="font-medium text-slate-800">Created:</span>{' '}
          {new Date(process.createdAt).toLocaleString()}
        </p>
        <p>
          <span className="font-medium text-slate-800">Updated:</span>{' '}
          {new Date(process.updatedAt).toLocaleString()}
        </p>
      </div>
    </Link>
  );
}