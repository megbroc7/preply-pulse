const PREPLY_PROFILE_URL = "https://preply.com/en/tutor/5385154";
const FALLBACK_LESSONS = 2124;

export interface PreplyStats {
  lessonCount: number;
  isLive: boolean;
}

export async function fetchPreplyStats(): Promise<PreplyStats> {
  try {
    const res = await fetch(PREPLY_PROFILE_URL, {
      next: { revalidate: 21600 },
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    });

    if (!res.ok) {
      return { lessonCount: FALLBACK_LESSONS, isLive: false };
    }

    const html = await res.text();

    const match = html.match(/"totalLessons"\s*:\s*(\d+)/);
    if (match) {
      const count = parseInt(match[1], 10);
      if (count > 0) {
        return { lessonCount: count, isLive: true };
      }
    }

    return { lessonCount: FALLBACK_LESSONS, isLive: false };
  } catch {
    return { lessonCount: FALLBACK_LESSONS, isLive: false };
  }
}
