const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const NOTES_DIR = path.join(ROOT, "fastlane/release-notes");
const BULLET = /^[-*]\s+(.+)$/;
const SKIP_CHECKBOX = /^\s*-\s*\[\s*x\s*\]\s*This PR has no user-visible changes and intentionally skips Google Play release notes\.\s*$/im;

function git(args) {
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8" });
}

function addedBullets(file, baseSha) {
  const relative = path.relative(ROOT, file).split(path.sep).join("/");
  const diff = git(["diff", "--no-ext-diff", "--unified=0", `${baseSha}...HEAD`, "--", relative]);
  const bullets = new Set();
  for (const line of diff.split("\n")) {
    if (!line.startsWith("+") || line.startsWith("+++")) continue;
    const match = BULLET.exec(line.slice(1).trim());
    if (match) bullets.add(match[1].trim());
  }
  return bullets;
}

function main() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) throw new Error("GITHUB_EVENT_PATH is required");

  const event = JSON.parse(fs.readFileSync(eventPath, "utf8"));
  const pullRequest = event.pull_request;
  if (!pullRequest) throw new Error("This check only supports pull_request events");

  if (SKIP_CHECKBOX.test(pullRequest.body || "")) {
    console.log("Google Play release notes skipped: PR explicitly has no user-visible changes");
    return;
  }

  const baseSha = process.env.BASE_SHA;
  if (!baseSha) throw new Error("BASE_SHA is required");

  const locales = fs
    .readdirSync(NOTES_DIR)
    .filter((name) => name.endsWith(".md"))
    .map((name) => name.slice(0, -3))
    .sort();
  const missing = locales.filter((locale) => addedBullets(path.join(NOTES_DIR, `${locale}.md`), baseSha).size === 0);

  if (missing.length > 0) {
    throw new Error(
      `Add at least one new Google Play release-note bullet for each locale (${locales.join(", ")}), ` +
        `or check "This PR has no user-visible changes and intentionally skips Google Play release notes." ` +
        `Missing: ${missing.join(", ")}`,
    );
  }

  console.log(`Google Play release-note bullets added for all locales: ${locales.join(", ")}`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(`error: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { addedBullets };
