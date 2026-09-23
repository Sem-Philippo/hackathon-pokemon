type PokemonData = {
    id: number;
    hp: number;
    atk: number;
    spAtk: number;
    def: number;
    spDef: number;
    speed: number;
    weight: number;
    canFly: boolean;
};

type PokemonFacing = "left" | "right";

const enum PokemonAction {
    None,
    Move,
    Idle,
    Flying,
    Landing,
}

export { PokemonAction, type PokemonData, type PokemonFacing };