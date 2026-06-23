interface StatusStepperProps {
  steps: string[]
  activeIndex: number
}

export default function StatusStepper({ steps, activeIndex }: StatusStepperProps) {
  return (
    <div className="grid grid-cols-5 gap-4 text-xs text-slate-400">
      {steps.map((step, index) => {
        const isActive = index === activeIndex
        const isComplete = index < activeIndex
        return (
          <div key={step} className="rounded-3xl border border-slate-700 p-3 bg-slate-900/60 shadow-glass">
            <div className="flex items-center gap-2">
              <div className={`h-6 w-6 rounded-full text-center text-[0.7rem] font-semibold ${isComplete ? 'bg-emerald-500 text-slate-950' : isActive ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                {index + 1}
              </div>
              <span className={isActive ? 'text-slate-100' : 'text-slate-500'}>{step}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
