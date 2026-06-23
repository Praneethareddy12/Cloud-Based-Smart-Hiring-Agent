import { useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { EvaluationResponse } from '../types/evaluation'
import ScoreCard from '../components/ScoreCard'
import BadgeList from '../components/BadgeList'
import RepositoryCard from '../components/RepositoryCard'

interface DashboardProps {
  data: EvaluationResponse
}

const COLORS = ['#10B981', '#FACC15', '#38BDF8', '#A855F7']

function scoreColor(score: number) {
  if (score >= 80) return 'text-emerald-300'
  if (score >= 60) return 'text-amber-300'
  return 'text-rose-300'
}

export default function Dashboard({ data }: DashboardProps) {
  const chartData = useMemo(
    () => [
      { name: 'Open Source', value: data.scores.open_source },
      { name: 'Self Projects', value: data.scores.self_projects },
      { name: 'Production', value: data.scores.production },
      { name: 'Technical Skills', value: data.scores.technical_skills },
    ],
    [data.scores],
  )

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-4xl border border-slate-700 bg-slate-900/70 p-8 shadow-glass">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Candidate Overview</p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-100">{data.candidate_name}</h1>
              <p className="mt-2 text-sm text-slate-400">GitHub username: {data.github.username || 'Unknown'}</p>
              <p className="mt-1 text-sm text-slate-400">Repositories found: {data.github.repositories ?? 0}</p>
            </div>
            <div className="flex h-44 w-44 items-center justify-center rounded-full border border-slate-700 bg-slate-950/70 text-center shadow-glass">
              <div>
                <p className={`text-5xl font-semibold ${scoreColor(data.overall_score)}`}>{Math.round(data.overall_score)}</p>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Overall</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <ScoreCard title="Open Source" score={data.scores.open_source} max={35} />
          <ScoreCard title="Self Projects" score={data.scores.self_projects} max={30} />
          <ScoreCard title="Production" score={data.scores.production} max={25} />
          <ScoreCard title="Technical Skills" score={data.scores.technical_skills} max={10} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.65fr_0.35fr]">
        <div className="rounded-4xl border border-slate-700 bg-slate-900/70 p-8 shadow-glass">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Score Breakdown</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-100">Category performance</h2>
            </div>
          </div>

          <div className="mt-8 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={3}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid gap-6">
          <BadgeList title="Strengths" items={data.strengths} accent="green" />
          <BadgeList title="Areas for Improvement" items={data.improvements} accent="amber" />
        </div>
      </div>

      <div className="grid gap-6">
        <div className="rounded-4xl border border-slate-700 bg-slate-900/70 p-8 shadow-glass">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">GitHub Analysis</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-100">Top repositories</h2>
            </div>
            <span className="rounded-full bg-slate-800 px-4 py-2 text-xs text-slate-400">{data.projects.length} projects</span>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {data.projects.slice(0, 4).map((project) => (
              <RepositoryCard
                key={project.name}
                name={project.name}
                description={project.description}
                url={project.github_url}
                stars={project.github_details?.stars}
                forks={project.github_details?.forks}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
