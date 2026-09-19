import fs from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/prisma/prismaClient";

export type PokeApiPokemon = {
  id: number;
  name: string;
  base_experience: number | null;
  height: number | null;
  weight: number | null;
  stats: Array<{ base_stat: number; effort: number; stat: { name: string; url: string } }>;
  types: Array<{ slot: number; type: { name: string; url: string } }>;
  cries?: { latest?: string };
};

export type PokeApiSpecies = {
  id: number;
  name: string;
  is_baby: boolean;
  is_legendary: boolean;
  is_mythical: boolean;
  growth_rate?: { name?: string } | null;
  gender_rate: number | null;
  evolves_from_species?: { url?: string } | null;
  evolution_chain?: { url?: string } | null;
  varieties?: Array<{ pokemon: { name: string; url: string } }>;
};

export type EvolutionDetail = {
  item?: { name?: string } | null;
  trigger?: { name?: string } | null;
  gender?: number | null;
  held_item?: { name?: string } | null;
  min_happiness?: number | null;
  min_beauty?: number | null;
  min_affection?: number | null;
  min_level?: number | null;
  time_of_day?: string | null;
};

export type PokeApiEvolutionChainNode = {
  species?: { name?: string; url?: string } | null;
  evolution_details?: EvolutionDetail[];
  evolves_to?: PokeApiEvolutionChainNode[];
};

export type PokeApiEvolutionChain = {
  chain: PokeApiEvolutionChainNode;
};

export function extractIdFromUrl(url?: string | null): number | null {
  if (!url) return null;
  const match = url.match(/\/([0-9]+)\/?$/);
  return match ? Number(match[1]) : null;
}

export function normalizePokemonName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed.includes("-")) return trimmed;
  return trimmed.split("-")[0];
}

export function normalizeFormName(name: string): string {
  const variant = name.toLowerCase();

  if (variant.includes("mega")) return "Mega";

  const regionalMatch = variant.match(/-(alola|galar|hisui|paldea)/i);
  if (regionalMatch) {
    return regionalMatch[1].charAt(0).toUpperCase() + regionalMatch[1].slice(1);
  }

  if (variant.includes("-")) return "Alt";
  return "Default";
}

export function resolveMinHappy(detail: Partial<EvolutionDetail>): number | null {
  const value = detail.min_happiness ?? detail.min_beauty ?? detail.min_affection ?? null;
  return value == null ? null : Number(value);
}

export function resolveMinLevel(detail: Partial<EvolutionDetail>): number | null {
  return detail.min_level == null ? null : Number(detail.min_level);
}

export type ImportSelection =
  | { mode: "all" }
  | { mode: "ids"; ids: number[] }
  | { mode: "range"; start: number; end: number };

export function parseImportArgs(args: string[] = []): ImportSelection {
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

  throw new Error("Unsupported import arguments. Use --all, --id <id>, or --from <start> --to <end>.");
}

export function resolveImportIds(selection: ImportSelection): number[] {
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

const POKEAPI_BASE = "https://pokeapi.co/api/v2";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatElapsed(startedAt: number): string {
  const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

class ImportProgress {
  private readonly interactive = Boolean(process.stdout.isTTY);
  private readonly barWidth = 24;
  private lineLength = 0;
  private startedAt = Date.now();
  private phase = "";
  private lastFallbackUpdate = 0;

  start(phase: string, total: number) {
    this.finish();
    this.phase = phase;
    this.startedAt = Date.now();
    this.lastFallbackUpdate = 0;
    this.update(0, total, "starting");
  }

  update(completed: number, total: number, detail: string) {
    const percentage = total === 0 ? 100 : Math.floor((completed / total) * 100);
    const filledWidth = total === 0 ? this.barWidth : Math.floor((completed / total) * this.barWidth);
    const bar = `${"#".repeat(filledWidth)}${"-".repeat(this.barWidth - filledWidth)}`;
    const line = `${this.phase} [${bar}] ${percentage.toString().padStart(3)}% (${completed}/${total}) ${detail} | ${formatElapsed(this.startedAt)}`;

    if (this.interactive) {
      const padding = Math.max(0, this.lineLength - line.length);
      process.stdout.write(`\r${line}${" ".repeat(padding)}`);
      this.lineLength = line.length;
      return;
    }

    if (completed === total || completed - this.lastFallbackUpdate >= 25 || total <= 25) {
      console.log(line);
      this.lastFallbackUpdate = completed;
    }
  }

  finish() {
    if (this.interactive && this.lineLength > 0) {
      process.stdout.write("\n");
      this.lineLength = 0;
    }
  }
}

export async function fetchJson<T>(url: string, optional = false): Promise<T | null> {
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    if (optional && response.status === 404) {
      return null;
    }
    throw new Error(`PokeAPI request failed (${response.status}) for ${url}`);
  }
  return response.json() as Promise<T>;
}

function buildPokemonStats(resource: PokeApiPokemon) {
  const statsByName = new Map<string, number>();
  for (const stat of resource.stats) {
    statsByName.set(stat.stat.name, stat.base_stat);
  }

  return {
    hp: statsByName.get("hp") ?? null,
    attack: statsByName.get("attack") ?? null,
    defense: statsByName.get("defense") ?? null,
    specialAttack: statsByName.get("special-attack") ?? null,
    specialDefense: statsByName.get("special-defense") ?? null,
    speed: statsByName.get("speed") ?? null,
  };
}

function buildPokemonTypeFields(resource: PokeApiPokemon) {
  const typeMap = new Map<number, string | null>();
  for (const entry of resource.types ?? []) {
    typeMap.set(entry.slot, entry.type.name);
  }

  return {
    type1: typeMap.get(1) ?? null,
    type2: typeMap.get(2) ?? null,
  };
}

async function ensureCryAsset(pokemonId: number, cryUrl?: string | null) {
  if (!cryUrl) return null;

  const outputDir = path.join(process.cwd(), "public", "media", "cries");
  await fs.mkdir(outputDir, { recursive: true });

  const response = await fetch(cryUrl);
  if (!response.ok) {
    throw new Error(`Unable to download cry for Pokémon ${pokemonId}: ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const filePath = path.join(outputDir, `${pokemonId}.ogg`);
  await fs.writeFile(filePath, buffer);
  return `/media/cries/${pokemonId}.ogg`;
}

async function importPokemonResource(pokemonId: number) {
  const resource = await fetchJson<PokeApiPokemon>(`${POKEAPI_BASE}/pokemon/${pokemonId}`);
  if (!resource) return;

  const stats = buildPokemonStats(resource);
  const types = buildPokemonTypeFields(resource);
  const species = await fetchJson<PokeApiSpecies>(`${POKEAPI_BASE}/pokemon-species/${pokemonId}`, true);

  const form = normalizeFormName(resource.name);
  const baseForm = species ? extractIdFromUrl(species.evolves_from_species?.url) ?? pokemonId : pokemonId;
  const cryFile = await ensureCryAsset(pokemonId, resource.cries?.latest ?? null);

  const record = {
    id: resource.id,
    speciesId: species?.id ?? resource.id,
    name: resource.name,
    baseExperience: resource.base_experience,
    height: resource.height,
    weight: resource.weight,
    hp: stats.hp,
    attack: stats.attack,
    defense: stats.defense,
    specialAttack: stats.specialAttack,
    specialDefense: stats.specialDefense,
    speed: stats.speed,
    type1: types.type1,
    type2: types.type2,
    form,
    baseForm,
    evolvesFromSpecies: species ? extractIdFromUrl(species.evolves_from_species?.url) ?? null : null,
    isBaby: species?.is_baby ?? null,
    isLegendary: species?.is_legendary ?? null,
    isMythical: species?.is_mythical ?? null,
    growthRate: species?.growth_rate?.name ?? null,
    genderRate: species?.gender_rate ?? null,
    cryFile,
  };

  await prisma.pokemon.upsert({
    where: { id: resource.id },
    update: record,
    create: record,
  });

  for (const variety of species?.varieties ?? []) {
    const varietyId = extractIdFromUrl(variety.pokemon.url);
    if (!varietyId || varietyId === pokemonId) continue;
    await importPokemonResource(varietyId);
  }
}

async function importEvolutionChain(chainId: number) {
  const chain = await fetchJson<PokeApiEvolutionChain>(`${POKEAPI_BASE}/evolution-chain/${chainId}`, true);
  if (!chain) return;

  const upsertEvolutionRow = async (row: {
    fromPokemonId: number;
    toPokemonId: number;
    item: string | null;
    trigger: string | null;
    gender: number | null;
    heldItem: string | null;
    minHappy: number | null;
    minLevel: number | null;
    timeOfDay: string | null;
  }) => {
    const existing = await prisma.evolution.findFirst({
      where: {
        fromPokemonId: row.fromPokemonId,
        toPokemonId: row.toPokemonId,
        item: row.item,
        trigger: row.trigger,
        gender: row.gender,
        heldItem: row.heldItem,
        minHappy: row.minHappy,
        minLevel: row.minLevel,
        timeOfDay: row.timeOfDay,
      },
    });

    if (existing) {
      await prisma.evolution.update({
        where: { id: existing.id },
        data: row,
      });
      return;
    }

    await prisma.evolution.create({ data: row });
  };

  const walk = async (node: PokeApiEvolutionChainNode) => {
    const currentSpeciesId = extractIdFromUrl(node.species?.url ?? null);
    if (!currentSpeciesId) return;

    for (const detail of node.evolves_to ?? []) {
      const targetId = extractIdFromUrl(detail.species?.url ?? null);
      if (!targetId) continue;

      await importPokemonResource(currentSpeciesId);
      await importPokemonResource(targetId);

      const templates = detail.evolution_details ?? [];

      if (templates.length > 0) {
        for (const entry of templates) {
          await upsertEvolutionRow({
            fromPokemonId: currentSpeciesId,
            toPokemonId: targetId,
            item: entry.item?.name ?? null,
            trigger: entry.trigger?.name ?? null,
            gender: entry.gender ?? null,
            heldItem: entry.held_item?.name ?? null,
            minHappy: resolveMinHappy(entry),
            minLevel: resolveMinLevel(entry),
            timeOfDay: entry.time_of_day || null,
          });
        }
      } else {
        await upsertEvolutionRow({
          fromPokemonId: currentSpeciesId,
          toPokemonId: targetId,
          item: null,
          trigger: null,
          gender: null,
          heldItem: null,
          minHappy: null,
          minLevel: null,
          timeOfDay: null,
        });
      }

      await walk(detail);
    }
  };

  await walk(chain.chain);
}

export async function importPokemonData(pokemonIds: number[] = []) {
  const ids = pokemonIds.length > 0 ? pokemonIds : [];
  const selectedIds = ids.length > 0 ? ids : await prisma.pokemon.findMany({ select: { id: true } }).then((rows) => rows.map((row) => row.id));

  const uniqueIds = [...new Set(selectedIds)].sort((a, b) => a - b);
  const progress = new ImportProgress();
  progress.start("Pokemon resources", uniqueIds.length);
  for (const [index, id] of uniqueIds.entries()) {
    await importPokemonResource(id);
    progress.update(index + 1, uniqueIds.length, `#${id}`);
    await sleep(120);
  }
  progress.finish();

  const speciesRows = await prisma.pokemon.findMany({
    select: { speciesId: true },
  });
  const speciesIds = [...new Set(speciesRows.map((row) => row.speciesId))];
  const chainIds = new Set<number>();
  progress.start("Finding evolution chains", speciesIds.length);
  for (const [index, speciesId] of speciesIds.entries()) {
    const species = await fetchJson<PokeApiSpecies>(`${POKEAPI_BASE}/pokemon-species/${speciesId}`, true);
    if (species) {
      const chainId = extractIdFromUrl(species.evolution_chain?.url ?? null);
      if (chainId) chainIds.add(chainId);
    }
    progress.update(index + 1, speciesIds.length, `species #${speciesId}`);
  }
  progress.finish();

  await prisma.evolution.deleteMany();
  const uniqueChainIds = [...chainIds].sort((a, b) => a - b);
  progress.start("Evolution chains", uniqueChainIds.length);
  for (const [index, chainId] of uniqueChainIds.entries()) {
    await importEvolutionChain(chainId);
    progress.update(index + 1, uniqueChainIds.length, `chain #${chainId}`);
    await sleep(120);
  }
  progress.finish();
  console.log(`Import complete: ${uniqueIds.length} Pokemon, ${uniqueChainIds.length} evolution chains.`);
}

export async function importSelectedPokemon(selection: ImportSelection) {
  const ids = resolveImportIds(selection);
  if (selection.mode === "all") {
    const baseIds = [] as number[];
    for (let id = 1; id <= 1025; id += 1) {
      baseIds.push(id);
    }
    await importPokemonData(baseIds);
    return;
  }

  await importPokemonData(ids);
}

export default importPokemonData;
