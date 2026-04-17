"use client";

import { track } from "@vercel/analytics/react";

export function CoffeeButton() {
  return (
    <a
      href="https://buymeacoffee.com/preplypulse"
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("espresso_clicked", { location: "floating_button" })}
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#FFDD00] text-black font-semibold text-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all"
      style={{ fontFamily: "'Bree Serif', serif" }}
      aria-label="Buy me an espresso"
    >
      <img
        src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg"
        alt=""
        className="h-5 w-auto"
      />
      Buy me an espresso
    </a>
  );
}
