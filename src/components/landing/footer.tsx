export function Footer() {
  return (
    <footer className="py-12 px-4 border-t bg-white">
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <p className="text-sm text-muted-foreground">Built by Megan B. — a Preply tutor who spent 2,118 hours learning the business side so you don&apos;t have to.</p>
        <div className="flex items-center justify-center gap-6 text-sm">
          <a href="https://buymeacoffee.com" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--preply-pink))] hover:underline">If this helped, buy me a coffee</a>
          <span className="text-muted-foreground">·</span>
          <a href="#" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:underline">Read the original Reddit post</a>
        </div>
        <p className="text-xs text-muted-foreground">PreplyPulse is not affiliated with Preply. Your data is processed entirely in your browser and is never sent to any server.</p>
      </div>
    </footer>
  );
}
