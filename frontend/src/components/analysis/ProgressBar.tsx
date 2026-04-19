interface Props {
  percentage: number;
  isRunning?: boolean;
  isCompleted?: boolean;
}

export default function ProgressBar({
  percentage,
  isRunning,
  isCompleted,
}: Props) {
  return (
    <div className="w-full">
      
      {/* 🔹 Estado */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {isRunning && (
            <span className="flex items-center gap-2 text-blue-600 font-medium">
              <span className="h-2 w-2 animate-ping rounded-full bg-blue-600" />
              Processing...
            </span>
          )}

          {isCompleted && (
            <span className="text-emerald-600 font-medium">
              Completed
            </span>
          )}

          {!isRunning && !isCompleted && (
            <span className="text-slate-500">
              Waiting to start
            </span>
          )}
        </div>

        <span className="text-slate-600">{percentage}%</span>
      </div>

      {/* 🔥 espacio grande */}
      <div className="mt-4" />

      {/* 🔹 Label */}
      <div className="mb-3 text-xs text-slate-500 uppercase tracking-wide">
        Progress
      </div>

      {/* 🔹 Barra */}
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-300">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isCompleted
              ? 'bg-emerald-500'
              : isRunning
              ? 'bg-blue-600 animate-pulse'
              : 'bg-slate-400'
          }`}
          style={{ width: `${percentage}%` }}
        />

        {isRunning && (
          <div className="absolute inset-0 animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        )}
      </div>
    </div>
  );
}