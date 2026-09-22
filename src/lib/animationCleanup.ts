import fs from "node:fs/promises";
import path from "node:path";

export type AnimationCleanupSelection =
  | { mode: "all" }
  | { mode: "ids"; ids: number[] }
  | { mode: "range"; start: number; end: number };

const SPRITE_DIR = path.join(process.cwd(), "public", "media", "sprites", "sprite");
const BACKUP_DIR = path.join(process.cwd(), "public", "media", "sprites", "sprite-backup");
const CANONICAL_ANIMATIONS = ["Idle", "Walk", "Fly", "Sleep", "Wake", "Happy", "Eat"] as const;

export function parseAnimationCleanupArgs(args: string[] = []): AnimationCleanupSelection {
  if (args.includes("--all") || args.length === 0) {
    return { mode: "all" };
  }

  if (args.includes("--id")) {
    const index = args.indexOf("--id");
    const value = args[index + 1];
    if (!value) {
      throw new Error("--id requires a numeric Pokémon ID.");
    }
    return { mode: "ids", ids: [Number(value)] };
  }

  if (args.includes("--from") || args.includes("--to")) {
    const fromIndex = args.indexOf("--from");
    const toIndex = args.indexOf("--to");
    const start = Number(args[fromIndex >= 0 ? fromIndex + 1 : 0]);
    const end = Number(args[toIndex >= 0 ? toIndex + 1 : 0]);

    if (!Number.isFinite(start) || !Number.isFinite(end)) {
      throw new Error("--from and --to require valid numeric Pokémon IDs.");
    }

    return { mode: "range", start, end };
  }

  if (args.length === 1) {
    return { mode: "ids", ids: [Number(args[0])] };
  }

  throw new Error("Unsupported cleanup arguments. Use --all, --id <id>, or --from <start> --to <end>.");
}

export function resolveAnimationCleanupIds(selection: AnimationCleanupSelection): number[] {
  switch (selection.mode) {
    case "all":
      return [];
    case "ids": {
      const ids = [...new Set(selection.ids.filter((id) => Number.isFinite(id) && id > 0))].sort((a, b) => a - b);
      return ids;
    }
    case "range": {
      const start = Math.min(selection.start, selection.end);
      const end = Math.max(selection.start, selection.end);
      const values: number[] = [];
      for (let id = start; id <= end; id += 1) values.push(id);
      return values;
    }
    default:
      return [];
  }
}

export function buildAnimationAliasMap(files: string[]): Record<string, string> {
  const normalized = new Set(files.map((file) => file.replace(/-Anim\.png$/i, "")));

  const choose = (primary: string, fallbacks: string[] = []) => {
    for (const candidate of [primary, ...fallbacks]) {
      if (normalized.has(candidate)) {
        return candidate;
      }
    }
    return null;
  };

  const aliases: Record<string, string | null> = {
    Idle: choose("Idle") ?? choose("Pose", ["Shake"]) ?? choose("Walk"),
    Walk: choose("Walk", ["Idle"]),
    Fly: choose("Charge", ["Idle", "Walk"]),
    Sleep: choose("EventSleep", ["Sleep", "Charge", "Idle", "Walk"]),
    Wake: choose("Wake", ["Idle", "Walk"]),
    Happy: choose("Pose", ["Shake", "Idle"]),
    Eat: choose("Eat", ["Shoot", "Idle", "Walk"]),
  };

  return Object.fromEntries(
    Object.entries(aliases).filter(([, value]) => value != null),
  ) as Record<string, string>;
}

function isAnimAsset(fileName: string): boolean {
  return /-Anim\.png$/i.test(fileName);
}

function isOffsetOrShadow(fileName: string): boolean {
  return /-(Offsets|Shadow)\.png$/i.test(fileName);
}

async function listSpriteIds(): Promise<number[]> {
  const entries = await fs.readdir(SPRITE_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => Number.parseInt(entry.name, 10))
    .filter((id) => Number.isFinite(id) && id >= 0)
    .sort((a, b) => a - b);
}

async function ensureBackupDestination(id: number) {
  const targetDir = path.join(BACKUP_DIR, String(id).padStart(4, "0"));
  await fs.mkdir(targetDir, { recursive: true });
  return targetDir;
}

function parseAnimName(fileName: string): string | null {
  return fileName.endsWith("-Anim.png") ? fileName.replace(/-Anim\.png$/i, "") : null;
}

function buildAnimDataXml(xmlText: string, mapping: Record<string, string>): string {
  const blocks = [...xmlText.matchAll(/<Anim>[\s\S]*?<\/Anim>/g)].map((match) => match[0]);
  const byName = new Map<string, string>();

  for (const block of blocks) {
    const nameMatch = block.match(/<Name>([\s\S]*?)<\/Name>/i);
    if (!nameMatch) continue;
    const name = nameMatch[1].trim();
    byName.set(name, block);
  }

  const keptBlocks = CANONICAL_ANIMATIONS.flatMap((canonical) => {
    const sourceName = mapping[canonical];
    if (!sourceName || !byName.has(sourceName)) return [];

    let block = byName.get(sourceName) ?? "";
    block = block.replace(/<Name>[\s\S]*?<\/Name>/i, `<Name>${canonical}</Name>`);
    return [block];
  });

  const xml = `<?xml version="1.0" ?>\n<AnimData>\n\t<ShadowSize>1</ShadowSize>\n\t<Anims>\n${keptBlocks
    .map((block) => `\t\t${block.replace(/\n/g, "\n\t\t")}`)
    .join("\n")}\n\t</Anims>\n</AnimData>\n`;

  return xml;
}

export async function cleanupAnimationFolder(id: number) {
  const folderPath = path.join(SPRITE_DIR, String(id).padStart(4, "0"));
  const folderExists = await fs
    .stat(folderPath)
    .then(() => true)
    .catch(() => false);

  if (!folderExists) {
    return { id, moved: [], kept: [], skipped: true, missingIdle: false, lostCase: false };
  }

  const entries = await fs.readdir(folderPath, { withFileTypes: true });
  const animFiles = entries.filter((entry) => entry.isFile() && isAnimAsset(entry.name)).map((entry) => entry.name);
  const mapping = buildAnimationAliasMap(animFiles);
  const hasFallback = Boolean(mapping.Idle || mapping.Happy || mapping.Walk);

  if (!hasFallback) {
    return { id, moved: [], kept: [], skipped: true, missingIdle: false, lostCase: true };
  }

  const keepTargets = new Set<string>();
  const sourceToCanonical = new Map<string, string>();

  for (const canonical of CANONICAL_ANIMATIONS) {
    const source = mapping[canonical];
    if (!source) continue;
    if (!sourceToCanonical.has(source)) {
      sourceToCanonical.set(source, canonical);
    }
  }

  for (const [source, canonical] of sourceToCanonical.entries()) {
    if (source === canonical) {
      keepTargets.add(`${source}-Anim.png`);
      continue;
    }

    if (source !== "Idle" && canonical !== "Idle") {
      keepTargets.add(`${canonical}-Anim.png`);
    }
  }

  const fallbackUsed = !animFiles.includes("Idle-Anim.png") && (animFiles.some((file) => /^(Pose|Shake)-Anim\.png$/i.test(file)) || animFiles.includes("Walk-Anim.png"));
  const backupDir = await ensureBackupDestination(id);
  const moved: string[] = [];
  const before = await fs.readdir(folderPath, { recursive: true }).catch(() => [] as string[]);

  for (const fileName of animFiles) {
    const sourceName = parseAnimName(fileName);
    if (!sourceName) continue;

    const canonicalTarget = sourceToCanonical.get(sourceName);
    if (canonicalTarget && canonicalTarget !== sourceName && sourceName !== "Idle") {
      const sourcePath = path.join(folderPath, fileName);
      const targetPath = path.join(folderPath, `${canonicalTarget}-Anim.png`);
      if (fileName !== `${canonicalTarget}-Anim.png`) {
        await fs.rename(sourcePath, targetPath);
      }
      continue;
    }

    if (!keepTargets.has(fileName)) {
      const sourcePath = path.join(folderPath, fileName);
      const relativePath = path.relative(folderPath, sourcePath).split(path.sep).join("/");
      const targetPath = path.join(backupDir, relativePath);
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.rename(sourcePath, targetPath);
      moved.push(relativePath);
    }
  }

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const fileName = entry.name;

    if (fileName === "AnimData.xml") {
      const xmlPath = path.join(folderPath, fileName);
      const xmlText = await fs.readFile(xmlPath, "utf8");
      await fs.writeFile(xmlPath, buildAnimDataXml(xmlText, mapping));
    } else if (isOffsetOrShadow(fileName) || !/\.(png|xml)$/i.test(fileName) || (fileName.endsWith(".png") && !fileName.endsWith("-Anim.png") && !fileName.endsWith("-Offsets.png") && !fileName.endsWith("-Shadow.png"))) {
      const sourcePath = path.join(folderPath, fileName);
      const relativePath = path.relative(folderPath, sourcePath).split(path.sep).join("/");
      const targetPath = path.join(backupDir, relativePath);
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.rename(sourcePath, targetPath);
      moved.push(relativePath);
    }
  }

  const after = await fs.readdir(folderPath, { recursive: true }).catch(() => [] as string[]);
  const movedPaths = before.filter((entry) => !after.includes(entry));

  return { id, moved: movedPaths, kept: [], skipped: false, missingIdle: fallbackUsed, lostCase: false };
}

export async function runAnimationCleanup(selection: AnimationCleanupSelection) {
  const ids = resolveAnimationCleanupIds(selection);
  const targetIds = ids.length > 0 ? ids : await listSpriteIds();

  await fs.mkdir(BACKUP_DIR, { recursive: true });

  const results = [] as Array<{ id: number; moved: string[]; kept: string[]; skipped: boolean; missingIdle?: boolean; lostCase?: boolean }>;

  for (const id of targetIds) {
    results.push(await cleanupAnimationFolder(id));
  }

  return results;
}
