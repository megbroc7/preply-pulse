import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("privacy verification trust surface", () => {
  it("links the footer to privacy, source, and deployed commit", () => {
    const footerPath = path.join(process.cwd(), "src/components/landing/footer.tsx");
    const footerSource = fs.readFileSync(footerPath, "utf8");
    const linkSource = fs.readFileSync(path.join(process.cwd(), "src/lib/source-links.ts"), "utf8");

    expect(footerSource).toContain('href="/privacy"');
    expect(footerSource).toContain("SOURCE_REPO_URL");
    expect(footerSource).toContain("getSourceCommitUrl(sourceCommitSha)");
    expect(footerSource).toContain("sourceCommitSha");
    expect(linkSource).toContain("https://github.com/megbroc7/preply-pulse");
    expect(linkSource).toContain("/commit/");
  });

  it("adds a privacy page with plain-language verification steps", () => {
    const pagePath = path.join(process.cwd(), "src/app/privacy/page.tsx");

    expect(fs.existsSync(pagePath)).toBe(true);

    const source = fs.readFileSync(pagePath, "utf8");
    expect(source).toContain("Your file is opened by your browser");
    expect(source).toContain("not uploaded, saved, stored in localStorage, sent to a server, or attached to Google Analytics");
    expect(source).toContain("After the page loads, you can turn off Wi-Fi");
    expect(source).toContain("Open DevTools");
    expect(source).toContain("Network tab");
  });
});
