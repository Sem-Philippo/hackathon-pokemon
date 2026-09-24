import { FoodItem } from "./Items";

type PokemonData = {
    id: number;
    PokemonUUID: string;
    name: string;
    hp: number;
    atk: number;
    spAtk: number;
    def: number;
    spDef: number;
    speed: number;
    weight: number;
    types: string[];
    canFly: boolean;
    likedFood: FoodItem;
    dislikedFood: FoodItem;
};

function assignPokemonFoodPreferences(seed: number) {
    const foods = Object.values(FoodItem)
        .filter((value): value is FoodItem => typeof value === "number");

    const likedFood = foods[seed % foods.length];
    const dislikedSeed = (seed + 1 + Math.floor(foods.length / 2)) % foods.length;
    const dislikedFood = foods[dislikedSeed] === likedFood
        ? foods[(dislikedSeed + 1) % foods.length]
        : foods[dislikedSeed];

    return {
        likedFood,
        dislikedFood,
    };
}

type PokemonFacing = "left" | "right";

const enum PokemonAction {
    None,
    Move,
    Idle,
    Flying,
    Landing,
    SlightlyHungry, // Will eat liked food
    Hungry, // Will eat liked and neutral food
    Starving, // Will eat hated food
}

export { PokemonAction, assignPokemonFoodPreferences, type PokemonData, type PokemonFacing };