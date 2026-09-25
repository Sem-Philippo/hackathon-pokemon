import { describe, expect, it } from "vitest";
import {
  extractIdFromUrl,
  normalizeFormName,
  normalizePokemonName,
  parseImportArgs,
  resolveMinLevel,
  resolveImportIds,
  resolveMinHappy,
} from "@/lib/pokemonImporter";

describe("pokemon importer helpers", () => {
  it("extracts ids from PokeAPI URLs", () => {
    expect(extractIdFromUrl("https://pokeapi.co/api/v2/pokemon/25/")).toBe(25);
    expect(extractIdFromUrl("https://pokeapi.co/api/v2/pokemon-species/10100/")).toBe(10100);
  });

  it("normalizes form names into the app values", () => {
    expect(normalizeFormName("pikachu")).toBe("Default");
    expect(normalizeFormName("pikachu-mega")).toBe("Mega");
    expect(normalizeFormName("raichu-alola")).toBe("Alola");
    expect(normalizeFormName("mewtwo-armored")).toBe("Alt");
  });

  it("normalizes Pokemon names for form variants", () => {
    expect(normalizePokemonName("raichu-alola")).toBe("raichu");
    expect(normalizePokemonName("pikachu-mega")).toBe("pikachu");
    expect(normalizePokemonName("mewtwo-armored")).toBe("mewtwo");
  });

  it("collapses happiness-like evolution requirements to minHappy", () => {
    expect(resolveMinHappy({ min_happiness: 220 })).toBe(220);
    expect(resolveMinHappy({ min_beauty: 123 })).toBe(123);
    expect(resolveMinHappy({ min_affection: 55 })).toBe(55);
    expect(resolveMinHappy({})).toBeNull();
  });

  it("keeps minimum level separate", () => {
    expect(resolveMinLevel({ min_level: 20 })).toBe(20);
    expect(resolveMinLevel({})).toBeNull();
  });

  it("resolves explicit IDs and ranges into a clean import list", () => {
    expect(resolveImportIds({ mode: "ids", ids: [25, 25, 7, 8] })).toEqual([7, 8, 25]);
    expect(resolveImportIds({ mode: "range", start: 10, end: 12 })).toEqual([10, 11, 12]);
    expect(resolveImportIds({ mode: "range", start: 12, end: 10 })).toEqual([10, 11, 12]);
  });

  it("parses CLI arguments into an import selection", () => {
    expect(parseImportArgs(["--all"])) .toEqual({ mode: "all" });
    expect(parseImportArgs(["--id", "25"])) .toEqual({ mode: "ids", ids: [25] });
    expect(parseImportArgs(["--from", "10", "--to", "12"])) .toEqual({ mode: "range", start: 10, end: 12 });
  });
});
