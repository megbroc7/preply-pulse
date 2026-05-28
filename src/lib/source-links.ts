export const SOURCE_REPO_URL = "https://github.com/megbroc7/preply-pulse";
export const SOURCE_COMMIT_FALLBACK_SHA = "7b4b368";

export function getSourceCommitUrl(commitSha: string): string {
  return `${SOURCE_REPO_URL}/commit/${commitSha}`;
}
