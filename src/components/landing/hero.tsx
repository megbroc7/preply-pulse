export function Hero() {
  return (
    <section className="py-20 px-4 text-center max-w-3xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-dm-sans)] leading-tight">
        See what 2,000+ hours on Preply actually taught me about the{" "}
        <span className="text-[hsl(var(--preply-pink))]">business side</span>
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">Made by a Preply tutor, for Preply tutors</p>
      <p className="mt-6 text-base text-muted-foreground max-w-xl mx-auto">
        Most tutors obsess over getting more trials. But the real levers are retention, pricing, speed-to-rebook, and knowing where your income actually comes from. Upload your Preply data and see it all in seconds.
      </p>
      <a href="#upload" className="mt-8 inline-block bg-[hsl(var(--preply-pink))] hover:bg-[hsl(var(--preply-pink-dark))] text-white font-medium px-8 py-3 rounded-lg transition-colors text-lg">
        Analyze Your Data
      </a>
    </section>
  );
}
