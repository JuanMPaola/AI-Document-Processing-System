import type { ProcessStatus } from '../../types/process.types';

const statusClasses: Record<ProcessStatus, string> = {
  PENDING: 'bg-slate-100 text-slate-700',
  RUNNING: 'bg-blue-100 text-blue-700',
  PAUSED: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  FAILED: 'bg-red-100 text-red-700',
  STOPPED: 'bg-zinc-200 text-zinc-700',
};

interface Props {
  status: ProcessStatus;
}

export default function ProcessStatusBadge({ status }: Props) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[status]}`}
    >
      {status}
    </span>
  );
}