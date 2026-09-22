type PokemonData = {
    hp: number;
    atk: number;
    spAtk: number;
    def: number;
    spDef: number;
    speed: number;
    weight: number;
    canFly: boolean;
};

const enum PokemonAction {
    None,
    Move,
    Idle,
    Flying,
    Landing,
}

export { PokemonAction, type PokemonData };