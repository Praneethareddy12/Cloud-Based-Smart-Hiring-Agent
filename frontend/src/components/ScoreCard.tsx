interface ScoreCardProps {
  title: string
  score: number
  max: number
}

export default function ScoreCard({ title, score, max }: ScoreCardProps) {
  const percentage = Math.min(100, Math.round((score / max) * 100))

  return (
    <div className="rounded-3xl border border-slate-700 bg-slate-900/70 p-5 shadow-glass">
      <div className="text-sm text-slate-400">{title}</div>
      <div className="mt-3 flex items-end justify-between gap-4">
        <div>
          <p className="text-3xl font-semibold text-slate-100">{score}</p>
          <p className="text-sm text-slate-500">/ {max}</p>
        </div>
        <div className="h-3 w-40 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-emerald-400"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  )
}
