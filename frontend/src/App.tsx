import { DragEvent, useMemo, useState, useEffect } from 'react'
import { jsPDF } from 'jspdf'
import type { EvaluationResponse } from './types/evaluation'
import { uploadResume, fetchHistory } from './services/api'
import Dashboard from './pages/Dashboard'
import StatusStepper from './components/StatusStepper'

const steps = [
  'Upload Resume',
  'Extracting Resume',
  'GitHub Analysis',
  'AI Evaluation',
  'Generating Dashboard',
]

function getStatusIndex(stage: string) {
  return steps.indexOf(stage)
}

export default function App() {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loadingStage, setLoadingStage] = useState<string | null>(null)
  const [data, setData] = useState<EvaluationResponse | null>(null)
  const [history, setHistory] = useState<any[]>([])

  const stageIndex = loadingStage ? getStatusIndex(loadingStage) : 0

  // Fetch history on component mount and when backend restarts
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const historyResponse = await fetchHistory()
        setHistory(historyResponse.history || [])
      } catch (err) {
        console.error('Failed to load history:', err)
      }
    }
    loadHistory()
  }, [])

  const handleFileChange = (selectedFile: File | null) => {
    setError(null)
    setFile(selectedFile)
  }

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    const droppedFile = event.dataTransfer.files?.[0] ?? null
    if (droppedFile) {
      handleFileChange(droppedFile)
    }
  }

  const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
  }

  const downloadJSON = () => {
    if (!data) return
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${data.candidate_name.replace(/\s+/g, '_')}_evaluation.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const downloadCSV = () => {
    if (!data) return
    const rows = [
      ['Candidate Name', data.candidate_name],
      ['Overall Score', data.overall_score.toString()],
      ['Open Source', data.scores.open_source.toString()],
      ['Self Projects', data.scores.self_projects.toString()],
      ['Production', data.scores.production.toString()],
      ['Technical Skills', data.scores.technical_skills.toString()],
      ['Bonus Points', data.bonus_points.toString()],
      ['GitHub Username', data.github.username || ''],
      ['Repositories', (data.github.repositories ?? 0).toString()],
    ]

    const csvContent = rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${data.candidate_name.replace(/\s+/g, '_')}_evaluation.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const downloadPDF = () => {
    if (!data) return
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    doc.setFontSize(18)
    doc.text('Hiring Agent Evaluation', 40, 50)
    doc.setFontSize(12)
    doc.text(`Candidate: ${data.candidate_name}`, 40, 80)
    doc.text(`Overall Score: ${data.overall_score}`, 40, 100)
    doc.text(`GitHub Username: ${data.github.username || 'Unknown'}`, 40, 120)
    doc.text('Scores:', 40, 150)
    const scoreLines = [
      `Open Source: ${data.scores.open_source}`,
      `Self Projects: ${data.scores.self_projects}`,
      `Production: ${data.scores.production}`,
      `Technical Skills: ${data.scores.technical_skills}`,
      `Bonus Points: ${data.bonus_points}`,
    ]
    scoreLines.forEach((line, index) => {
      doc.text(line, 60, 175 + index * 18)
    })
    doc.text('Strengths:', 40, 260)
    data.strengths.forEach((item, index) => {
      doc.text(`- ${item}`, 60, 280 + index * 18)
    })
    doc.text('Areas for Improvement:', 40, 340)
    data.improvements.forEach((item, index) => {
      doc.text(`- ${item}`, 60, 360 + index * 18)
    })
    doc.save(`${data.candidate_name.replace(/\s+/g, '_')}_evaluation.pdf`)
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a PDF file first.')
      return
    }

    setError(null)
    setData(null)
    setLoadingStage(steps[0])

    try {
      setLoadingStage(steps[1])
      const response = await uploadResume(file)
      setLoadingStage(steps[3])
      setData(response)
      setLoadingStage(steps[4])

      const historyResponse = await fetchHistory()
      setHistory(historyResponse.history || [])
    } catch (err: any) {
      setError(err.message ?? 'Unexpected error during upload.')
    } finally {
      setLoadingStage(null)
    }
  }

  const isButtonDisabled = !file || Boolean(loadingStage)

  const metrics = useMemo(() => {
    if (!history.length) {
      return {
        total: 0,
        average: 0,
        highest: 0,
        lowest: 0,
      }
    }

    const scores = history.map((item) => item.overall_score)
    return {
      total: history.length,
      average: Number((scores.reduce((sum, value) => sum + value, 0) / scores.length).toFixed(1)),
      highest: Math.max(...scores),
      lowest: Math.min(...scores),
    }
  }, [history])

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.15),_transparent_40%),radial-gradient(circle_at_bottom,_rgba(16,185,129,0.12),_transparent_35%),#020617] px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-[2rem] border border-slate-700 bg-slate-950/80 p-8 shadow-glass">
          <h1 className="text-4xl font-semibold text-white">Hiring Agent Dashboard</h1>
          <p className="mt-3 max-w-2xl text-slate-400">Modern recruiter experience for resume evaluation, GitHub analysis, and talent scoring. Upload a PDF and get a visual scorecard with strengths, improvements, and history.</p>
        </header>

        <section className="grid gap-6 xl:grid-cols-[0.72fr_0.28fr]">
          <div className="rounded-[2rem] border border-slate-700 bg-slate-900/70 p-8 shadow-glass">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Resume Upload</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-100">Drag, drop, or choose a PDF</h2>
              </div>
              <button
                type="button"
                disabled={isButtonDisabled}
                onClick={handleUpload}
                className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingStage ? 'Evaluating…' : 'Evaluate Resume'}
              </button>
            </div>

            <div className="rounded-4xl border border-dashed border-slate-700 bg-slate-950/40 p-8">
              <label
                className="flex min-h-[180px] flex-col items-center justify-center gap-4 rounded-[1.5rem] border border-slate-700 bg-slate-900/60 p-8 text-center transition hover:border-slate-500"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
                />
                <p className="text-lg font-semibold text-slate-100">Drag & drop or click to select a PDF resume</p>
                <p className="text-sm text-slate-500">Only PDF files are supported.</p>
                {file ? <p className="text-sm text-slate-400">Selected file: {file.name}</p> : null}
              </label>
            </div>

            {error ? <div className="mt-4 rounded-3xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div> : null}

            {loadingStage ? (
              <div className="mt-6 rounded-3xl border border-slate-700 bg-slate-900/70 p-6 shadow-glass">
                <p className="text-sm text-slate-400">{loadingStage}</p>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full w-full animate-pulse rounded-full bg-emerald-500/70" />
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-slate-700 bg-slate-900/70 p-8 shadow-glass">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Evaluation History</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-100">Recent runs</h2>
              <div className="mt-6 space-y-3">
                {history.length > 0 ? (
                  history.map((item) => (
                    <div key={item.id} className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-semibold text-slate-100">{item.candidate_name}</p>
                        <p className="text-sm text-slate-500">{new Date(item.timestamp).toLocaleString()}</p>
                      </div>
                      <p className="mt-2 text-sm text-slate-400">Score: {item.overall_score}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No evaluations yet.</p>
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-700 bg-slate-900/70 p-8 shadow-glass">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Dashboard Metrics</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-700 bg-slate-950/80 p-5">
                  <p className="text-sm text-slate-400">Total resumes processed</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-100">{metrics.total}</p>
                </div>
                <div className="rounded-3xl border border-slate-700 bg-slate-950/80 p-5">
                  <p className="text-sm text-slate-400">Average score</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-100">{metrics.average}</p>
                </div>
                <div className="rounded-3xl border border-slate-700 bg-slate-950/80 p-5">
                  <p className="text-sm text-slate-400">Highest score</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-100">{metrics.highest}</p>
                </div>
                <div className="rounded-3xl border border-slate-700 bg-slate-950/80 p-5">
                  <p className="text-sm text-slate-400">Lowest score</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-100">{metrics.lowest}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {data ? (
          <section className="rounded-[2rem] border border-slate-700 bg-slate-900/70 p-8 shadow-glass">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <StatusStepper steps={steps} activeIndex={stageIndex} />
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={downloadJSON}
                  className="rounded-full bg-slate-700 px-5 py-2 text-sm text-slate-100 transition hover:bg-slate-600"
                >
                  Download JSON
                </button>
                <button
                  type="button"
                  onClick={downloadCSV}
                  className="rounded-full bg-slate-700 px-5 py-2 text-sm text-slate-100 transition hover:bg-slate-600"
                >
                  Download CSV
                </button>
                <button
                  type="button"
                  onClick={downloadPDF}
                  className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                >
                  Download PDF
                </button>
              </div>
            </div>
            <div className="mt-8">
              <Dashboard data={data} />
            </div>
          </section>
        ) : null}
      </div>
    </div>
  )
}
