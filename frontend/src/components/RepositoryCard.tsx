interface RepositoryCardProps {
  name: string
  description?: string
  url?: string
  stars?: number
  forks?: number
}

export default function RepositoryCard({ name, description, url, stars, forks }: RepositoryCardProps) {
  return (
    <div className="rounded-3xl border border-slate-700 bg-slate-900/70 p-5 shadow-glass">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-slate-100">{name}</h3>
        {url ? (
          <a href={url} target="_blank" rel="noreferrer" className="text-sky-400 hover:text-sky-200">
            View
          </a>
        ) : null}
      </div>
      <p className="mt-3 text-sm text-slate-400">{description || 'No description available.'}</p>
      <div className="mt-4 flex gap-3 text-xs text-slate-500">
        <span>⭐ {stars ?? 0}</span>
        <span>🍴 {forks ?? 0}</span>
      </div>
    </div>
  )
}
