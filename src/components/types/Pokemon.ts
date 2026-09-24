import { FoodItem } from "./Items";

type PokemonData = {
    id: number;
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

export { PokemonAction, type PokemonData, type PokemonFacing };