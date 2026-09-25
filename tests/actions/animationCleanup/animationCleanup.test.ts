import { describe, expect, it } from "vitest";
import {
  buildAnimationAliasMap,
  parseAnimationCleanupArgs,
  resolveAnimationCleanupIds,
} from "@/lib/animationCleanup";

describe("animation cleanup helpers", () => {
  it("parses the supported selection args", () => {
    expect(parseAnimationCleanupArgs(["--all"])).toEqual({ mode: "all" });
    expect(parseAnimationCleanupArgs(["--id", "25"])).toEqual({ mode: "ids", ids: [25] });
    expect(parseAnimationCleanupArgs(["--from", "10", "--to", "20"])).toEqual({
      mode: "range",
      start: 10,
      end: 20,
    });
  });

  it("resolves ranges and ids consistently", () => {
    expect(resolveAnimationCleanupIds({ mode: "ids", ids: [2, 5, 2] })).toEqual([2, 5]);
    expect(resolveAnimationCleanupIds({ mode: "range", start: 10, end: 6 })).toEqual([6, 7, 8, 9, 10]);
  });

  it("builds the correct animation aliases and fallbacks", () => {
    expect(
      buildAnimationAliasMap([
        "Idle-Anim.png",
        "Walk-Anim.png",
        "Charge-Anim.png",
        "EventSleep-Anim.png",
        "Wake-Anim.png",
        "Pose-Anim.png",
        "Eat-Anim.png",
      ]),
    ).toEqual({
      Idle: "Idle",
      Walk: "Walk",
      Fly: "Charge",
      Sleep: "EventSleep",
      Wake: "Wake",
      Happy: "Pose",
      Eat: "Eat",
    });

    expect(
      buildAnimationAliasMap([
        "Idle-Anim.png",
        "Shoot-Anim.png",
      ]),
    ).toEqual({
      Idle: "Idle",
      Walk: "Idle",
      Fly: "Idle",
      Sleep: "Idle",
      Wake: "Idle",
      Happy: "Idle",
      Eat: "Shoot",
    });

    expect(buildAnimationAliasMap(["Pose-Anim.png"])).toEqual({
      Idle: "Pose",
      Walk: "Pose",
      Fly: "Pose",
      Sleep: "Pose",
      Wake: "Pose",
      Happy: "Pose",
      Eat: "Pose",
    });

    expect(buildAnimationAliasMap(["Walk-Anim.png"])).toEqual({
      Idle: "Walk",
      Walk: "Walk",
      Fly: "Walk",
      Sleep: "Walk",
      Wake: "Walk",
      Happy: "Walk",
      Eat: "Walk",
    });

    expect(buildAnimationAliasMap(["Charge-Anim.png"])).toEqual({
      Idle: "Charge",
      Walk: "Charge",
      Fly: "Charge",
      Sleep: "Charge",
      Wake: "Charge",
      Happy: "Charge",
      Eat: "Charge",
    });
  });
});
