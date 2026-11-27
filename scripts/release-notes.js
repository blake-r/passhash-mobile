const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const NOTES_DIR = path.join(ROOT, "fastlane/release-notes");
const METADATA_DIR = path.join(ROOT, "fastlane/metadata/android");
const MAX_LENGTH = 500;
const BULLET = /^[-*]\s+(.+)$/;
const VALUE_FLAGS = ["--version-code", "--base-tag", "--tag", "--body-out"];

function git(args) {
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8" });
}

function gitSucceeds(args) {
  try {
    execFileSync("git", args, { cwd: ROOT, stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function parseArgs(argv) {
  const args = {
    versionCode: process.env.VERSION_CODE || "",
    baseTag: process.env.BASE_TAG || undefined,
    tag: process.env.VERSION_NAME || "",
    bodyOut: "",
    dryRun: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--dry-run") {
      args.dryRun = true;
      continue;
    }
    if (arg === "--no-base") {
      args.baseTag = "";
      continue;
    }
    const eq = arg.indexOf("=");
    const name = eq === -1 ? arg : arg.slice(0, eq);
    if (!VALUE_FLAGS.includes(name)) throw new Error(`Unknown argument: ${arg}`);
    let value;
    if (eq === -1) {
      value = argv[i + 1];
      i += 1;
    } else {
      value = arg.slice(eq + 1);
    }
    if (!value) throw new Error(`${name} needs a value`);
    if (name === "--version-code") args.versionCode = value;
    else if (name === "--base-tag") args.baseTag = value;
    else if (name === "--tag") args.tag = value;
    else args.bodyOut = value;
  }
  if (args.versionCode && !/^\d+$/.test(args.versionCode)) {
    throw new Error(`versionCode must be numeric, got "${args.versionCode}"`);
  }
  return args;
}

function readBullets(file) {
  const bullets = [];
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const match = BULLET.exec(line.trim());
    if (!match) continue;
    const text = match[1].trim();
    if (!bullets.includes(text)) bullets.push(text);
  }
  return bullets;
}

function previouslyPublished(locale) {
  const changelogDir = path.join(METADATA_DIR, locale, "changelogs");
  if (!fs.existsSync(changelogDir)) return new Set();
  const bullets = new Set();
  for (const name of fs.readdirSync(changelogDir)) {
    if (!/^\d+\.txt$/.test(name)) continue;
    for (const bullet of readBullets(path.join(changelogDir, name))) bullets.add(bullet);
  }
  return bullets;
}

function addedSince(file, baseTag) {
  const relative = path.relative(ROOT, file).split(path.sep).join("/");
  const diff = git(["diff", "--unified=0", `${baseTag}..HEAD`, "--", relative]);
  const added = new Set();
  for (const line of diff.split("\n")) {
    if (!line.startsWith("+") || line.startsWith("+++")) continue;
    const match = BULLET.exec(line.slice(1).trim());
    if (match) added.add(match[1].trim());
  }
  return added;
}

function latestAncestorTag() {
  let tags;
  try {
    tags = git(["tag", "--list", "--sort=-creatordate"]).split("\n").filter(Boolean);
  } catch {
    return "";
  }
  for (const tag of tags) {
    if (gitSucceeds(["merge-base", "--is-ancestor", tag, "HEAD"])) return tag;
  }
  return "";
}

function setWorkflowOutput(name, value) {
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
}

function repoSlug() {
  if (process.env.GITHUB_REPOSITORY) return process.env.GITHUB_REPOSITORY;
  try {
    const url = git(["remote", "get-url", "origin"]).trim();
    const match = url.match(/github\.com[:/]([^/]+)\/(.+?)(?:\.git)?$/);
    return match ? `${match[1]}/${match[2]}` : "";
  } catch {
    return "";
  }
}

function buildBody({ tag, baseTag, versionCode, results }) {
  const primary = results.find((result) => result.locale === "en-US") || results[0];
  // The release title already carries the tag, so the body starts with the notes.
  const parts = ["## What's new", "", primary.text, ""];
  for (const result of results) {
    if (result === primary) continue;
    parts.push(`<details><summary>${result.locale}</summary>`, "", result.text, "", "</details>", "");
  }
  const slug = repoSlug();
  if (baseTag && slug) {
    parts.push(`**Full Changelog**: https://github.com/${slug}/compare/${baseTag}...${tag}`, "");
  }
  if (versionCode) {
    // Publishing this GitHub release triggers publish-play.yml, which reads the
    // versionCode from here instead of guessing it from the tag.
    parts.push(`<!-- play-version-code: ${versionCode} -->`, "");
  }
  return parts.join("\n");
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

  const baseTag = args.baseTag === undefined ? latestAncestorTag() : args.baseTag;
  const results = [];
  const emptyLocales = [];
  const problems = [];

  for (const locale of locales) {
    if (!/^[a-z]{2}-[A-Z]{2}$/.test(locale)) {
      problems.push(`${locale}: not a Google Play locale code (expected e.g. en-US)`);
      continue;
    }

    const source = path.join(NOTES_DIR, `${locale}.md`);
    let bullets;
    try {
      bullets = readBullets(source);
      if (baseTag) {
        const added = addedSince(source, baseTag);
        bullets = bullets.filter((bullet) => added.has(bullet));
      }
      const published = previouslyPublished(locale);
      bullets = bullets.filter((bullet) => !published.has(bullet));
    } catch (error) {
      problems.push(`${locale}: ${error.message}`);
      continue;
    }

    if (bullets.length === 0) {
      emptyLocales.push(locale);
      continue;
    }

    const text = bullets.map((bullet) => `- ${bullet}`).join("\n");
    const length = [...text].length;
    if (length > MAX_LENGTH) {
      problems.push(`${locale}: ${length} characters, Google Play allows ${MAX_LENGTH}`);
      continue;
    }

    results.push({
      locale,
      text,
      length,
      changelogDir: path.join(METADATA_DIR, locale, "changelogs"),
      source,
    });
  }

  if (results.length === 0 && emptyLocales.length === locales.length && problems.length === 0) {
    setWorkflowOutput("has_notes", "false");
    console.log(`No unpublished Google Play release notes for ${locales.join(", ")}; changelogs skipped.`);
    console.log(`base tag: ${baseTag || "(none)"}`);
    return;
  }

  if (emptyLocales.length > 0) {
    problems.push(`No unpublished release-note bullets for: ${emptyLocales.join(", ")}`);
  }
  if (problems.length > 0) {
    for (const problem of problems) console.error(`error: ${problem}`);
    process.exit(1);
  }

  setWorkflowOutput("has_notes", "true");

  for (const result of results) {
    const targets = [path.join(result.changelogDir, "default.txt")];
    if (args.versionCode) targets.push(path.join(result.changelogDir, `${args.versionCode}.txt`));
    for (const target of targets) {
      if (!args.dryRun) {
        fs.mkdirSync(result.changelogDir, { recursive: true });
        fs.writeFileSync(target, `${result.text}\n`);
      }
      console.log(`${args.dryRun ? "would write" : "wrote"} ${path.relative(ROOT, target)}`);
    }
    console.log(`  ${result.locale} — ${result.length}/${MAX_LENGTH} characters`);
  }

  console.log(`base tag: ${baseTag || "(none)"}`);

  if (args.bodyOut && args.tag) {
    const body = buildBody({ tag: args.tag, baseTag, versionCode: args.versionCode, results });
    if (!args.dryRun) fs.writeFileSync(args.bodyOut, body);
    console.log(`${args.dryRun ? "would write" : "wrote"} ${args.bodyOut}`);
  }
}

if (require.main === module) main();

module.exports = { readBullets };
