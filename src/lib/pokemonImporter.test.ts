import { describe, expect, it } from "vitest";
import {
  extractIdFromUrl,
  normalizeFormName,
  normalizePokemonName,
  resolveMinValue,
} from "./pokemonImporter";

describe("pokemonImporter helpers", () => {
  it("extracts numeric ids from PokeAPI urls", () => {
    expect(extractIdFromUrl("https://pokeapi.co/api/v2/pokemon/25/")).toBe(25);
    expect(extractIdFromUrl("https://pokeapi.co/api/v2/pokemon-species/10100/")).toBe(10100);
  });

  it("normalizes forms to the app categories", () => {
    expect(normalizeFormName("pikachu")).toBe("Default");
    expect(normalizeFormName("pikachu-mega")).toBe("Mega");
    expect(normalizeFormName("raichu-alola")).toBe("Alola");
    expect(normalizeFormName("mewtwo-armored")).toBe("Alt");
  });

  it("normalizes names by stripping variant suffixes", () => {
    expect(normalizePokemonName("raichu-alola")).toBe("raichu");
    expect(normalizePokemonName("pikachu-mega")).toBe("pikachu");
    expect(normalizePokemonName("mewtwo-armored")).toBe("mewtwo");
  });

  it("collapses evolution requirement fields into a single min value", () => {
    expect(resolveMinValue({ min_happiness: 220 })).toBe(220);
    expect(resolveMinValue({ min_beauty: 123 })).toBe(123);
    expect(resolveMinValue({ min_affection: 55 })).toBe(55);
    expect(resolveMinValue({})).toBeNull();
  });
});
