import { describe, expect, it } from "vitest";
import {
  parsePortraitCleanupArgs,
  pickPortraitFilesToKeep,
  resolvePortraitCleanupIds,
} from "@/lib/portraitCleanup";

describe("portrait cleanup helpers", () => {
  it("parses supported selection arguments", () => {
    expect(parsePortraitCleanupArgs(["--all"])).toEqual({ mode: "all" });
    expect(parsePortraitCleanupArgs(["--id", "25"])).toEqual({ mode: "ids", ids: [25] });
    expect(parsePortraitCleanupArgs(["--from", "10", "--to", "20"])).toEqual({
      mode: "range",
      start: 10,
      end: 20,
    });
  });

  it("resolves ids from a range or explicit selection", () => {
    expect(resolvePortraitCleanupIds({ mode: "ids", ids: [2, 5, 2] })).toEqual([2, 5]);
    expect(resolvePortraitCleanupIds({ mode: "range", start: 10, end: 6 })).toEqual([6, 7, 8, 9, 10]);
  });

  it("keeps only valid portrait states and required fallbacks", () => {
    expect(
      pickPortraitFilesToKeep([
        "Normal.png",
        "Happy.png",
        "Joyous.png",
        "Sad.png",
        "Crying.png",
        "Angry.png",
        "Inspired.png",
        "Teary-Eyed.png",
      ]),
    ).toEqual([
      "Normal.png",
      "Happy.png",
      "Joyous.png",
      "Sad.png",
      "Crying.png",
    ]);

    expect(
      pickPortraitFilesToKeep([
        "Normal.png",
        "Angry.png",
        "Shouting.png",
        "Teary-Eyed.png",
      ]),
    ).toEqual(["Normal.png", "Teary-Eyed.png"]);

    expect(
      pickPortraitFilesToKeep([
        "Normal.png",
        "Angry.png",
        "Shouting.png",
        "Worried.png",
      ]),
    ).toEqual(["Normal.png", "Worried.png"]);

    expect(
      pickPortraitFilesToKeep([
        "Normal.png",
        "Angry.png",
        "Shouting.png",
        "Stunned.png",
      ]),
    ).toEqual(["Normal.png", "Stunned.png"]);

    expect(
      pickPortraitFilesToKeep([
        "Normal.png",
        "Angry.png",
        "Shouting.png",
      ]),
    ).toEqual(["Normal.png"]);

    expect(
      pickPortraitFilesToKeep([
        "Normal.png",
        "Angry.png",
        "Shouting.png",
        "Inspired.png",
      ]),
    ).toEqual(["Normal.png", "Inspired.png"]);
  });

  it("ignores metadata files when deciding which portrait images to move", () => {
    expect(
      pickPortraitFilesToKeep(["Normal.png", "credits.txt", "Angry.png", "Dizzy.png"]),
    ).toEqual(["Normal.png"]);
  });

  it("supports recursive portrait folder layouts with nested form directories", () => {
    expect(
      pickPortraitFilesToKeep([
        "Normal.png",
        "Angry.png",
        "Crying.png",
        "0000/Happy.png",
        "0000/Angry.png",
        "0001/Sad.png",
      ]),
    ).toEqual(["Normal.png", "Crying.png", "0000/Happy.png", "0001/Sad.png"]);
  });
});
