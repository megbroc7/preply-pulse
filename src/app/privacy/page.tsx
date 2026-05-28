import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Code2, ExternalLink, SearchCheck, ShieldCheck, WifiOff } from "lucide-react";
import { getDeployedCommitSha } from "@/lib/deployed-commit";
import { getSourceCommitUrl, SOURCE_REPO_URL } from "@/lib/source-links";

export const metadata: Metadata = {
  title: "Privacy & Verification - PreplyPulse",
  description:
    "How PreplyPulse handles CSV files, plus simple steps tutors can use to verify that their data stays in the browser.",
};

export default function PrivacyPage() {
  const sourceCommitSha = getDeployedCommitSha();
  const shortCommitSha = sourceCommitSha.slice(0, 7);

  return (
    <main className="min-h-screen bg-[#fafafa] text-gray-950">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-5 py-10 md:py-14">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to PreplyPulse
        </Link>

        <header className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Privacy & verification
          </div>
          <div className="space-y-4">
            <h1 className="font-[family-name:var(--font-dm-sans)] text-4xl font-bold tracking-normal md:text-5xl">
              You can verify how your CSV is handled.
            </h1>
            <p className="text-lg leading-8 text-gray-600">
              PreplyPulse is built as a client-side tool. Your file is opened by your browser, parsed in memory, and used to calculate the dashboard.
            </p>
          </div>
        </header>

        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="font-[family-name:var(--font-dm-sans)] text-xl font-semibold">
            What does not happen
          </h2>
          <p className="mt-3 leading-7 text-gray-600">
            Your CSV is not uploaded, saved, stored in localStorage, sent to a server, or attached to Google Analytics.
          </p>
        </section>

        <section className="space-y-5">
          <div>
            <h2 className="font-[family-name:var(--font-dm-sans)] text-2xl font-semibold">
              Verify it yourself
            </h2>
            <p className="mt-2 leading-7 text-gray-600">
              You do not have to take the privacy claim on trust. These checks are quick and visible in your own browser.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-pink-50 text-[hsl(var(--preply-pink))]">
                <SearchCheck className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="font-[family-name:var(--font-dm-sans)] text-base font-semibold">
                Check the Network tab
              </h3>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-gray-600">
                <li>Open DevTools in your browser.</li>
                <li>Go to the Network tab.</li>
                <li>Clear the visible requests.</li>
                <li>Upload a CSV.</li>
                <li>Confirm no request sends the file after upload.</li>
              </ol>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                <WifiOff className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="font-[family-name:var(--font-dm-sans)] text-base font-semibold">
                Try it offline
              </h3>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                After the page loads, you can turn off Wi-Fi and still upload the CSV, parse it, and see the dashboard because the work happens in your browser.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="font-[family-name:var(--font-dm-sans)] text-xl font-semibold">
            Open source
          </h2>
          <p className="mt-3 leading-7 text-gray-600">
            The source code is public, and the deployed commit link points to the version Vercel reports for the current deployment when that value is available.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <a
              href={SOURCE_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
            >
              <Code2 className="h-4 w-4" aria-hidden="true" />
              View source
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
            <a
              href={getSourceCommitUrl(sourceCommitSha)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:text-gray-950"
            >
              Deployed commit {shortCommitSha}
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
