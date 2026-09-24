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

function assignPokemonFoodPreferences(types: (PokemonType | null)[]) {
    const foodPreferences = {
        "fire": {
            likedFood: FoodItem.Cheri_Berry,
            dislikedFood: FoodItem.Chesto_Berry
        },
        "grass": {
            likedFood: FoodItem.Chesto_Berry,
            dislikedFood: FoodItem.Rawst_Berry
        },
        "water": {
            likedFood: FoodItem.Rawst_Berry,
            dislikedFood: FoodItem.Aspear_Berry
        },
        "electric": {
            likedFood: FoodItem.Aspear_Berry,
            dislikedFood: FoodItem.Pecha_Berry
        },
        "flying": {
            likedFood: FoodItem.Pecha_Berry,
            dislikedFood: FoodItem.Lum_Berry
        },
        "rock": {
            likedFood: FoodItem.Lum_Berry,
            dislikedFood: FoodItem.Sitrus_Berry
        },
        "ground": {
            likedFood: FoodItem.Sitrus_Berry,
            dislikedFood: FoodItem.Oran_Berry
        },
        "ice": {
            likedFood: FoodItem.Oran_Berry,
            dislikedFood: FoodItem.Cheri_Berry
        },
        "ghost": {
            likedFood: FoodItem.Cheri_Berry,
            dislikedFood: FoodItem.Rawst_Berry
        },
        "dark": {
            likedFood: FoodItem.Chesto_Berry,
            dislikedFood: FoodItem.Aspear_Berry
        },
        "fighting": {
            likedFood: FoodItem.Rawst_Berry,
            dislikedFood: FoodItem.Pecha_Berry
        },
        "psychic": {
            likedFood: FoodItem.Aspear_Berry,
            dislikedFood: FoodItem.Lum_Berry
        },
        "metal": {
            likedFood: FoodItem.Pecha_Berry,
            dislikedFood: FoodItem.Sitrus_Berry
        },
        "poison": {
            likedFood: FoodItem.Lum_Berry,
            dislikedFood: FoodItem.Oran_Berry
        },
        "fairy": {
            likedFood: FoodItem.Sitrus_Berry,
            dislikedFood: FoodItem.Cheri_Berry
        },
        "dragon": {
            likedFood: FoodItem.Oran_Berry,
            dislikedFood: FoodItem.Chesto_Berry
        },
        "bug": {
            likedFood: FoodItem.Rawst_Berry,
            dislikedFood: FoodItem.Aspear_Berry
        },
        "normal": {
            likedFood: FoodItem.Oran_Berry,
            dislikedFood: FoodItem.Rawst_Berry
        },
    }

    const type1 = types.at(0);
    const type2 = types.at(1);

    if (!type1) {
        return { likedFood: FoodItem.Sitrus_Berry, dislikedFood: FoodItem.Oran_Berry }
    }

    const likedFood = foodPreferences[type1].likedFood;
    let dislikedFood = foodPreferences[type1].dislikedFood;

    if (type2 && foodPreferences[type2].dislikedFood !== likedFood) {
        dislikedFood = foodPreferences[type2].dislikedFood;
    }

    return {
        likedFood,
        dislikedFood,
    };
}

type PokemonFacing = "left" | "right";

const enum PokemonType {
    Normal = "normal",
    Fire = "fire",
    Grass = "grass",
    Water = "water",
    Electric = "electric",
    Flying = "flying",
    Rock = "rock",
    Ground = "ground",
    Ice = "ice",
    Ghost = "ghost",
    Dark = "dark",
    Fighting = "fighting",
    Psychic = "psychic",
    Metal = "metal",
    Poison = "poison",
    Fairy = "fairy",
    Dragon = "dragon",
    Bug = "bug",
}

const enum PokemonAction {
    None,
    Move,
    Idle,
    Flying,
    Landing,
    SlightlyHungry, // Will eat liked food
    Hungry, // Will eat liked and neutral food
    Starving, // Will eat hated food
    Sleep,
}

export { PokemonAction, assignPokemonFoodPreferences, type PokemonData, type PokemonFacing, PokemonType };