interface MetricCardProps {
  title: string
  value: string | number
  description: string
}

export default function MetricCard({ title, value, description }: MetricCardProps) {
  return (
    <div className="rounded-3xl border border-slate-700 bg-slate-900/70 p-5 shadow-glass">
      <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{title}</p>
      <p className="mt-4 text-4xl font-semibold text-slate-100">{value}</p>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
    </div>
  )
}
