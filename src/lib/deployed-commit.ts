import { SOURCE_COMMIT_FALLBACK_SHA } from "@/lib/source-links";

export function getDeployedCommitSha(): string {
  return (
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
    SOURCE_COMMIT_FALLBACK_SHA
  );
}
