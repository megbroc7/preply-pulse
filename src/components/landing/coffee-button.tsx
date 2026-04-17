export function CoffeeButton() {
  return (
    <a
      href="https://buymeacoffee.com"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed top-5 right-5 z-50 flex items-center gap-2 pl-3 pr-4 py-2 rounded-full bg-white/90 backdrop-blur-sm border border-amber-100 shadow-md hover:shadow-lg transition-all group animate-[pulse-gentle_3s_ease-in-out_infinite] hover:animate-none hover:scale-105"
      aria-label="Buy me a coffee"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5 11h12a3 3 0 0 1 0 6h-1v1a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-7Z"
          fill="#FBBF24"
          stroke="#D97706"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M17 11h1a3 3 0 0 1 0 6h-1"
          stroke="#D97706"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 2v3M12 2v3M10 3v2"
          stroke="#D97706"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>
      <span className="text-xs font-medium text-amber-700 hidden sm:inline">
        Buy me a coffee
      </span>
    </a>
  );
}
