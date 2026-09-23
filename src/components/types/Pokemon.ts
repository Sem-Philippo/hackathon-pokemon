import { FoodItem } from "./Items";

type PokemonData = {
    name: string;
    hp: number;
    atk: number;
    spAtk: number;
    def: number;
    spDef: number;
    speed: number;
    weight: number;
    canFly: boolean;
    likedFood: FoodItem;
    dislikedFood: FoodItem;
};

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

export { PokemonAction, type PokemonData };