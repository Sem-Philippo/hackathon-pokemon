import { describe, expect, it } from "vitest";
import {
  DEFAULT_POKEMON_ANIMATION_STATE_MAP,
  PokemonAnimationController,
  getPokemonAnimationForState,
} from "@/lib/pokemonAnimations";

describe("pokemon sprite animations", () => {
  it("maps state names to the canonical sprite animations", () => {
    expect(getPokemonAnimationForState("idle")).toBe("Idle");
    expect(getPokemonAnimationForState("walk")).toBe("Walk");
    expect(getPokemonAnimationForState("fly")).toBe("Fly");
    expect(getPokemonAnimationForState("happy")).toBe("Happy");
    expect(getPokemonAnimationForState("eat")).toBe("Eat");
    expect(getPokemonAnimationForState("unknown" as never)).toBeNull();
  });

  it("tracks the active animation and loop mode", () => {
    const controller = new PokemonAnimationController(DEFAULT_POKEMON_ANIMATION_STATE_MAP);

    controller.startAnimation("walk", false);
    expect(controller.getCurrentAnimation()).toBe("Walk");
    expect(controller.isAnimationPlaying()).toBe(true);
    expect(controller.isAnimationPlaying("Walk")).toBe(true);
    expect(controller.isAnimationPlaying("Idle")).toBe(false);
    expect(controller.isLooping()).toBe(false);

    controller.pauseAnimation();
    expect(controller.isAnimationPlaying()).toBe(false);

    controller.startAnimation("idle");
    expect(controller.getCurrentAnimation()).toBe("Idle");

    controller.stopAnimation();
    expect(controller.getCurrentAnimation()).toBeNull();
    expect(controller.isAnimationPlaying()).toBe(false);
  });
});
