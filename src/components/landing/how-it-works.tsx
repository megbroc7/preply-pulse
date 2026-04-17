const STEPS = [
  { number: "1", title: "Export your data", description: "Go to your Preply tutor dashboard and export your activity report as a CSV file." },
  { number: "2", title: "Upload it here", description: "Drop your CSV into PreplyPulse. Your data never leaves your browser." },
  { number: "3", title: "See your insights", description: "Get a personalized dashboard with actionable business insights in seconds." },
];

export function HowItWorks() {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold font-[family-name:var(--font-dm-sans)] text-center mb-12">How it works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map((step) => (
            <div key={step.number} className="text-center">
              <div className="w-12 h-12 rounded-full bg-[hsl(var(--preply-pink))] text-white flex items-center justify-center mx-auto text-xl font-bold font-[family-name:var(--font-dm-sans)]">{step.number}</div>
              <h3 className="mt-4 font-semibold font-[family-name:var(--font-dm-sans)]">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
