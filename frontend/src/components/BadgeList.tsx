interface BadgeListProps {
  title: string
  items: string[]
  accent: 'green' | 'amber'
}

export default function BadgeList({ title, items, accent }: BadgeListProps) {
  return (
    <div className="rounded-3xl border border-slate-700 bg-slate-900/70 p-5 shadow-glass">
      <p className="text-sm text-slate-400">{title}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className={`rounded-full px-4 py-2 text-xs font-semibold ${
              accent === 'green'
                ? 'bg-emerald-500/20 text-emerald-200'
                : 'bg-amber-500/20 text-amber-200'
            }`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
