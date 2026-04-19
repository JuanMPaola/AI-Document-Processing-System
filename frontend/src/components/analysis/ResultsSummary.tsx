import type { AnalysisAggregateResults } from '../../types/analysis.types';

interface Props {
  results: AnalysisAggregateResults | null;
}

export default function ResultsSummary({ results }: Props) {
  if (!results) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-400 bg-slate-50 p-10 text-center text-sm text-slate-500">
        No summary available yet.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-md">
        <p className="text-sm text-slate-500">Total Words</p>
        <p className="mt-2 text-2xl font-bold text-slate-900">
          {results.total_words}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-md">
        <p className="text-sm text-slate-500">Total Lines</p>
        <p className="mt-2 text-2xl font-bold text-slate-900">
          {results.total_lines}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-md">
        <p className="text-sm text-slate-500">Files Processed</p>
        <p className="mt-2 text-2xl font-bold text-slate-900">
          {results.files_processed.length}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-md md:col-span-3">
        <p className="mb-2 text-sm text-slate-500">Most Frequent Words</p>
        <div className="flex flex-wrap gap-2">
          {results.most_frequent_words.length > 0 ? (
            results.most_frequent_words.map((word) => (
              <span
                key={word}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
              >
                {word}
              </span>
            ))
          ) : (
            <span className="text-sm text-slate-500">No keywords available</span>
          )}
        </div>
      </div>
    </div>
  );
}