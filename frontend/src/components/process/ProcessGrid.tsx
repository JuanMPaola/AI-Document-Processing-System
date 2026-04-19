import type { ProcessItem } from '../../types/process.types';
import ProcessCard from './ProcessCard';

interface Props {
  processes: ProcessItem[];
}

export default function ProcessGrid({ processes }: Props) {
  if (!processes.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
        No processes yet.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {processes.map((process) => (
        <ProcessCard key={process.id} process={process} />
      ))}
    </div>
  );
}