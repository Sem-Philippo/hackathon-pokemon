import fs from "node:fs/promises";
import path from "node:path";

export type PortraitCleanupSelection =
  | { mode: "all" }
  | { mode: "ids"; ids: number[] }
  | { mode: "range"; start: number; end: number };

const PORTRAIT_DIR = path.join(process.cwd(), "public", "media", "sprites", "portrait");
const BACKUP_DIR = path.join(process.cwd(), "public", "media", "sprites", "portrait-backup");

export function parsePortraitCleanupArgs(args: string[] = []): PortraitCleanupSelection {
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

export function resolvePortraitCleanupIds(selection: PortraitCleanupSelection): number[] {
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

export function pickPortraitFilesToKeep(files: string[]): string[] {
  const normalized = files.map((file) => path.basename(file));
  const keep = new Set<string>();

  if (normalized.includes("Normal.png")) {
    keep.add("Normal.png");
  }

  const happyFiles = ["Happy.png", "Joyous.png"].filter((file) => normalized.includes(file));
  if (happyFiles.length > 0) {
    for (const file of happyFiles) {
      keep.add(file);
    }
  } else if (normalized.includes("Inspired.png")) {
    keep.add("Inspired.png");
  }

  const sadFiles = ["Sad.png", "Crying.png"].filter((file) => normalized.includes(file));
  if (sadFiles.length > 0) {
    for (const file of sadFiles) {
      keep.add(file);
    }
  } else {
    const fallbackSad = ["Teary-Eyed.png", "Worried.png", "Stunned.png"].find((file) => normalized.includes(file));
    if (fallbackSad) {
      keep.add(fallbackSad);
    }
  }

  return files.filter((file) => keep.has(path.basename(file)));
}

function isPortraitAsset(fileName: string): boolean {
  return /\.(png|jpe?g|webp)$/i.test(fileName);
}

export async function listPortraitIds(): Promise<number[]> {
  const entries = await fs.readdir(PORTRAIT_DIR, { withFileTypes: true });

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

async function cleanupDirectory(dirPath: string, backupRoot: string, pokemonRoot: string) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const portraitFiles = entries
    .filter((entry) => entry.isFile() && isPortraitAsset(entry.name))
    .map((entry) => entry.name);

  if (portraitFiles.length > 0) {
    const keep = new Set(pickPortraitFilesToKeep(portraitFiles));

    for (const fileName of portraitFiles) {
      if (keep.has(fileName)) continue;

      const sourcePath = path.join(dirPath, fileName);
      const relativePath = path.relative(pokemonRoot, sourcePath).split(path.sep).join("/");
      const targetPath = path.join(backupRoot, relativePath);
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.rename(sourcePath, targetPath);
    }
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const childPath = path.join(dirPath, entry.name);
    await cleanupDirectory(childPath, backupRoot, pokemonRoot);
  }
}

export async function cleanupPortraitFolder(id: number) {
  const folderPath = path.join(PORTRAIT_DIR, String(id).padStart(4, "0"));
  const folderExists = await fs
    .stat(folderPath)
    .then(() => true)
    .catch(() => false);

  if (!folderExists) {
    return { id, moved: [], kept: [], skipped: true };
  }

  const backupDir = await ensureBackupDestination(id);
  const before = await fs.readdir(folderPath, { recursive: true }).catch(() => [] as string[]);
  await cleanupDirectory(folderPath, backupDir, folderPath);
  const after = await fs.readdir(folderPath, { recursive: true }).catch(() => [] as string[]);

  const moved = before.filter((entry) => !after.includes(entry));
  return { id, moved, kept: [], skipped: false };
}

export async function runPortraitCleanup(selection: PortraitCleanupSelection) {
  const ids = resolvePortraitCleanupIds(selection);
  const targetIds = ids.length > 0 ? ids : await listPortraitIds();

  await fs.mkdir(BACKUP_DIR, { recursive: true });

  const results = [] as Array<{ id: number; moved: string[]; kept: string[]; skipped: boolean }>;

  for (const id of targetIds) {
    results.push(await cleanupPortraitFolder(id));
  }

  return results;
}
