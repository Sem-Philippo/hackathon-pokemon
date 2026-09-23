"use server";

import { prisma } from "@/prisma/prismaClient";

const pokemonCount = 10;
const maxPokemonId = 1025;

function randomPokemonIds() {
  const ids = new Set<number>();

  while (ids.size < pokemonCount) {
    ids.add(Math.floor(Math.random() * maxPokemonId) + 1);
  }

  return [...ids];
}

export async function listPokemon() {
  const pokemon = await prisma.pokemon.findMany({
    where: { id: { in: randomPokemonIds() } },
    select: {
      id: true,
      name: true,
      hp: true,
      attack: true,
      specialAttack: true,
      defense: true,
      specialDefense: true,
      speed: true,
      weight: true,
      type1: true,
      type2: true,
    },
  });

  return pokemon.map((entry) => ({
    id: entry.id,
    name: entry.name,
    hp: entry.hp ?? 0,
    atk: entry.attack ?? 0,
    spAtk: entry.specialAttack ?? 0,
    def: entry.defense ?? 0,
    spDef: entry.specialDefense ?? 0,
    speed: entry.speed ?? 0,
    weight: entry.weight ?? 0,
    types: [entry.type1, entry.type2].filter((type): type is string => type !== null),
    canFly: entry.type1 === "flying" || entry.type2 === "flying",
  }));
}