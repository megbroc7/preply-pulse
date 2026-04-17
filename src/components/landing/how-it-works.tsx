const STEPS = [
  {
    number: "1",
    title: "Export from Preply",
    description: "Go to your tutor dashboard, download your activity report as a CSV. Takes 30 seconds.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
  },
  {
    number: "2",
    title: "Drop it here",
    description: "Drag your CSV into PreplyPulse. Everything runs in your browser. We never see your data.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
  },
  {
    number: "3",
    title: "See your business",
    description: "Retention, pricing gaps, revenue concentration, and reactivation targets. All of it, instantly.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <p className="text-center text-[13px] font-medium tracking-widest uppercase text-[hsl(var(--preply-pink))] mb-3">
          How it works
        </p>
        <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-dm-sans)] text-center mb-16">
          Three steps. Under a minute.
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map((step, i) => (
            <div
              key={step.number}
              className="relative group rounded-2xl border border-gray-100 bg-white p-6 transition-all hover:border-pink-100 hover:shadow-lg hover:shadow-pink-50/50 hover:-translate-y-1"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-[hsl(var(--preply-pink))]/10 text-[hsl(var(--preply-pink))] flex items-center justify-center">
                  {step.icon}
                </div>
                <span className="text-xs font-mono text-gray-300 tracking-wider">
                  STEP {step.number}
                </span>
              </div>
              <h3 className="text-base font-semibold font-[family-name:var(--font-dm-sans)] mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
