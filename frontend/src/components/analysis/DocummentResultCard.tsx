import type { AnalysisDocumentResult } from '../../types/analysis.types';

interface Props {
  result: AnalysisDocumentResult;
}

export default function DocumentResultCard({ result }: Props) {
  return (
   <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-md">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900">
          {result.file_name}
        </h3>
        <p className="mt-1 font-mono text-xs text-slate-500">
          {result.document_id}
        </p>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        <div>
          <p className="text-xs text-slate-500">Status</p>
          <p className="text-sm font-semibold text-slate-900">
            {result.status}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Words</p>
          <p className="text-sm font-semibold text-slate-900">
            {result.total_words}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Lines</p>
          <p className="text-sm font-semibold text-slate-900">
            {result.total_lines}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Characters</p>
          <p className="text-sm font-semibold text-slate-900">
            {result.total_characters}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <p className="mb-2 text-xs text-slate-500">Summary</p>
        <p className="text-sm leading-6 text-slate-700">
          {result.summary ?? 'No summary available.'}
        </p>
      </div>

      <div>
        <p className="mb-2 text-xs text-slate-500">Most Frequent Words</p>
        <div className="flex flex-wrap gap-2">
          {result.most_frequent_words?.length ? (
            result.most_frequent_words.map((item, index) => (
              <span
                key={`${result.document_id}-${item.word}-${index}`}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
              >
                {item.word} ({item.count})
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-500">No keywords available</span>
          )}
        </div>
      </div>
    </div>
  );
}