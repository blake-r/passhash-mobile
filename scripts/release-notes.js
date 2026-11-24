const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const NOTES_DIR = path.join(ROOT, "fastlane/release-notes");
const METADATA_DIR = path.join(ROOT, "fastlane/metadata/android");
const MAX_LENGTH = 500;

function parseArgs(argv) {
  const args = { versionCode: process.env.VERSION_CODE || "", dryRun: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--dry-run") {
      args.dryRun = true;
    } else if (arg.startsWith("--version-code=")) {
      args.versionCode = arg.slice("--version-code=".length);
    } else if (arg === "--version-code") {
      args.versionCode = argv[i + 1] || "";
      i += 1;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  if (args.versionCode && !/^\d+$/.test(args.versionCode)) {
    throw new Error(`versionCode must be numeric, got "${args.versionCode}"`);
  }
  return args;
}

function readLatestSection(file) {
  const lines = fs.readFileSync(file, "utf8").split("\n");
  const start = lines.findIndex((line) => /^##\s+\d{4}-\d{2}-\d{2}\s*$/.test(line));
  if (start === -1) {
    throw new Error(`${path.relative(ROOT, file)}: no "## YYYY-MM-DD" section found`);
  }
  const heading = lines[start].trim().replace(/^##\s+/, "");
  const body = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^##\s+/.test(lines[i])) break;
    body.push(lines[i]);
  }
  const text = body.join("\n").trim();
  if (!text) {
    throw new Error(`${path.relative(ROOT, file)}: section ${heading} is empty`);
  }
  return { heading, text };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!fs.existsSync(NOTES_DIR)) {
    throw new Error(`Missing ${path.relative(ROOT, NOTES_DIR)}`);
  }

  const locales = fs
    .readdirSync(NOTES_DIR)
    .filter((name) => name.endsWith(".md"))
    .map((name) => name.slice(0, -3))
    .sort();

  if (locales.length === 0) {
    throw new Error(`No locale files in ${path.relative(ROOT, NOTES_DIR)}`);
  }

  const results = [];
  const problems = [];

  for (const locale of locales) {
    const source = path.join(NOTES_DIR, `${locale}.md`);
    const changelogDir = path.join(METADATA_DIR, locale, "changelogs");
    if (!/^[a-z]{2}-[A-Z]{2}$/.test(locale)) {
      problems.push(`${locale}: not a Google Play locale code (expected e.g. en-US)`);
      continue;
    }

    let section;
    try {
      section = readLatestSection(source);
    } catch (error) {
      problems.push(error.message);
      continue;
    }

    const length = [...section.text].length;
    if (length > MAX_LENGTH) {
      problems.push(`${locale}: ${length} characters, Google Play allows ${MAX_LENGTH}`);
      continue;
    }

    results.push({ locale, ...section, length, changelogDir });
  }

  if (problems.length > 0) {
    for (const problem of problems) console.error(`error: ${problem}`);
    process.exit(1);
  }

  for (const result of results) {
    const targets = [path.join(result.changelogDir, "default.txt")];
    if (args.versionCode) {
      targets.push(path.join(result.changelogDir, `${args.versionCode}.txt`));
    }
    for (const target of targets) {
      if (!args.dryRun) {
        fs.mkdirSync(result.changelogDir, { recursive: true });
        fs.writeFileSync(target, `${result.text}\n`);
      }
      console.log(`${args.dryRun ? "would write" : "wrote"} ${path.relative(ROOT, target)}`);
    }
    console.log(`  ${result.locale} ${result.heading} — ${result.length}/${MAX_LENGTH} characters`);
  }
}

main();
