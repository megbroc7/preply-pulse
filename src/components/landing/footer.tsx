interface FooterProps {
  lessonCount?: number;
}

export function Footer({ lessonCount }: FooterProps) {
  const count = lessonCount ? lessonCount.toLocaleString("en-US") : "2,000+";

  return (
    <footer className="py-16 px-4 border-t border-gray-100">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-3 rounded-full bg-white/80 border border-gray-100 pl-1.5 pr-5 py-1.5 shadow-sm">
          <img
            src="https://avatars.preply.com/i/logos/i/logos/avatar_chr62d0iny.jpg"
            alt="Megan B."
            className="w-8 h-8 rounded-full object-cover ring-2 ring-white"
          />
          <span className="text-sm text-gray-900 font-medium font-[family-name:var(--font-dm-sans)]">
            Built by Megan B.
          </span>
        </div>
        <p className="text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
          A Preply tutor with {count}&nbsp;lessons taught who built this tool so
          you don&apos;t have to figure out the business side alone.
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
            href="https://www.reddit.com/r/Preply/comments/1smgs0s/lessons_learned_after_2118_hours_on_preply/"
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
