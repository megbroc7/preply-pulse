export function Footer() {
  return (
    <footer className="py-16 px-4 border-t border-gray-100">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <p className="text-sm text-gray-900 font-medium font-[family-name:var(--font-dm-sans)]">
          Built by Megan B.
        </p>
        <p className="text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
          A Preply tutor who spent 2,118 hours learning the business side — and built this tool so you don&apos;t have to figure it out alone.
        </p>
        <div className="flex items-center justify-center gap-5 text-sm">
          <a
            href="https://buymeacoffee.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-amber-600 hover:text-amber-700 transition-colors font-medium"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M5 11h12a3 3 0 0 1 0 6h-1v1a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-7Z" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M17 11h1a3 3 0 0 1 0 6h-1" stroke="#D97706" strokeWidth="1.5" />
            </svg>
            Buy me a coffee
          </a>
          <span className="w-px h-4 bg-gray-200" />
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            Read the Reddit post
          </a>
        </div>
        <div className="pt-6">
          <p className="text-xs text-gray-300">
            PreplyPulse is not affiliated with Preply. Your data is processed entirely in your browser.
          </p>
        </div>
      </div>
    </footer>
  );
}
