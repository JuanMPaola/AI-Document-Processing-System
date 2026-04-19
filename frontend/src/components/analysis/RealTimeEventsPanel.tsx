interface Props {
  events: {
    type: string;
    payload: unknown;
  }[];
}

export default function RealtimeEventsPanel({ events }: Props) {
  return (
    <div className="rounded-2xl border border-slate-300 bg-slate-100 p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">
        Realtime Events
      </h2>

      {events.length === 0 ? (
        <p className="text-sm text-slate-500">No realtime events yet.</p>
      ) : (
        <div className="max-h-[420px] overflow-y-auto pr-2">
          <ul className="space-y-3">
            {events.map((event, index) => (
              <li
                key={`${event.type}-${index}`}
                className="rounded-xl border border-slate-200 bg-white p-3"
              >
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {event.type}
                </p>
                <pre className="overflow-x-auto whitespace-pre-wrap text-xs text-slate-700">
                  {JSON.stringify(event.payload, null, 2)}
                </pre>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}