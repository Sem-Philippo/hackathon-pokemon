export type PokemonAnimationState =
  | "none"
  | "idle"
  | "wait"
  | "move"
  | "walk"
  | "run"
  | "fly"
  | "flying"
  | "landing"
  | "sleep"
  | "wake"
  | "happy"
  | "eat";

export type PokemonAnimationName = "Idle" | "Walk" | "Fly" | "Sleep" | "Wake" | "Happy" | "Eat";

export type PokemonAnimationOptions = {
  loop?: boolean;
  idleChance?: number;
  state?: PokemonAnimationState | string;
};

export type PokemonSpriteFacing = "left" | "right" | "front" | "back";

export type PokemonAnimationMetadata = {
  name: string;
  index: number;
  frameWidth: number;
  frameHeight: number;
  durations: number[];
  hitFrame?: number;
  returnFrame?: number;
};

export const DEFAULT_POKEMON_ANIMATION_STATE_MAP: Record<string, string> = {
  none: "",
  idle: "Idle",
  wait: "Idle",
  move: "Walk",
  walk: "Walk",
  run: "Walk",
  fly: "Fly",
  flying: "Fly",
  landing: "Fly",
  sleep: "Sleep",
  wake: "Wake",
  happy: "Happy",
  eat: "Eat",
};

export const DEFAULT_IDLE_ANIMATION_CHANCE = 0.2;

export const SPRITE_ANIMATION_METADATA: Record<string, { frameWidth: number; frameHeight: number; frameCount: number; durations: number[]; rowCount?: number }> = {
  Idle: { frameWidth: 32, frameHeight: 40, frameCount: 3, durations: [40, 6, 6] },
  Walk: { frameWidth: 40, frameHeight: 40, frameCount: 6, durations: [4, 4, 4, 4, 4, 4] },
  Fly: { frameWidth: 32, frameHeight: 40, frameCount: 10, durations: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2] },
  Sleep: { frameWidth: 24, frameHeight: 24, frameCount: 2, durations: [30, 35] },
  Wake: { frameWidth: 32, frameHeight: 24, frameCount: 6, durations: [8, 4, 12, 4, 10, 4] },
  Happy: { frameWidth: 24, frameHeight: 32, frameCount: 5, durations: [8, 1, 3, 2, 8] },
  Eat: { frameWidth: 24, frameHeight: 32, frameCount: 4, durations: [6, 8, 6, 8] },
};

export function shouldPlayIdleAnimation(randomValue = Math.random(), chance = DEFAULT_IDLE_ANIMATION_CHANCE): boolean {
  return randomValue < chance;
}

export function normalizePokemonAnimationName(animationName: string | null | undefined): string | null {
  if (!animationName) return null;

  const normalized = animationName.trim();
  if (!normalized) return null;

  const directMatch = DEFAULT_POKEMON_ANIMATION_STATE_MAP[normalized.toLowerCase()];
  if (directMatch) return directMatch;

  const canonical = Object.values(DEFAULT_POKEMON_ANIMATION_STATE_MAP).find(
    (value) => value.toLowerCase() === normalized.toLowerCase(),
  );

  if (canonical) return canonical;

  return null;
}

export function getPokemonAnimationForState(state: string | null | undefined): string | null {
  if (!state) return null;

  const normalized = state.trim();
  if (!normalized) return null;

  const animation = normalizePokemonAnimationName(normalized);
  if (animation) return animation;

  const stateAlias = normalized.toLowerCase().replace(/[^a-z]/g, "");
  return Object.entries(DEFAULT_POKEMON_ANIMATION_STATE_MAP).reduce<string | null>((match, [key, value]) => {
    if (match) {
      return match;
    }

    if (key.replace(/[^a-z]/g, "") === stateAlias) {
      return value;
    }

    return null;
  }, null);
}

export function parseSpriteAnimationXml(xmlText: string): PokemonAnimationMetadata[] {
  const blocks = [...xmlText.matchAll(/<Anim>[\s\S]*?<\/Anim>/gi)].map((match) => match[0]);

  return blocks
    .map((block) => {
      const name = block.match(/<Name>\s*([^<]+?)\s*<\/Name>/i)?.[1]?.trim();
      if (!name) {
        return null;
      }

      const index = Number(block.match(/<Index>\s*(\d+)\s*<\/Index>/i)?.[1] ?? "0");
      const frameWidth = Number(block.match(/<FrameWidth>\s*(\d+)\s*<\/FrameWidth>/i)?.[1] ?? "0");
      const frameHeight = Number(block.match(/<FrameHeight>\s*(\d+)\s*<\/FrameHeight>/i)?.[1] ?? "0");
      const durations = [...block.matchAll(/<Duration>\s*(\d+)\s*<\/Duration>/gi)].map((match) => Number(match[1]));
      const hitFrame = block.match(/<HitFrame>\s*(\d+)\s*<\/HitFrame>/i)?.[1];
      const returnFrame = block.match(/<ReturnFrame>\s*(\d+)\s*<\/ReturnFrame>/i)?.[1];

      return {
        name,
        index,
        frameWidth,
        frameHeight,
        durations,
        ...(hitFrame ? { hitFrame: Number(hitFrame) } : {}),
        ...(returnFrame ? { returnFrame: Number(returnFrame) } : {}),
      };
    })
    .filter((animation): animation is PokemonAnimationMetadata => animation !== null);
}

export function isFrontFacingAnimation(animationName: string | null | undefined): boolean {
  const normalized = normalizePokemonAnimationName(animationName ?? "");
  if (!normalized) {
    return false;
  }

  return ["Idle", "Happy", "Eat", "Sleep", "Wake"].includes(normalized);
}

export function getSpriteRowForFacing(
  facing: PokemonSpriteFacing,
  sheetRows = 8,
  animationName?: string | null,
): number {
  if (animationName && isFrontFacingAnimation(animationName)) {
    return 0;
  }

  if (facing === "front" || facing === "back") {
    return 0;
  }

  if (sheetRows <= 1) {
    return 0;
  }

  if (facing === "right") {
    return sheetRows === 8 ? 2 : 0;
  }

  return sheetRows === 8 ? 6 : 0;
}

export function getPokemonAnimationFrameStyle(
  animationName: string | null | undefined,
  facing: PokemonSpriteFacing,
  frameIndex: number,
  frameWidth = 32,
  frameHeight = 32,
  frameCount = 1,
  totalRows = 8,
  totalColumns = frameCount,
): { width: number; height: number; backgroundPosition: string; backgroundSize: string } {
  const row = getSpriteRowForFacing(facing, totalRows, animationName);
  const x = (frameIndex % Math.max(totalColumns, 1)) * frameWidth;
  const y = row * frameHeight;

  return {
    width: frameWidth,
    height: frameHeight,
    backgroundPosition: `-${x}px -${y}px`,
    backgroundSize: `${Math.max(totalColumns, 1) * frameWidth}px ${Math.max(totalRows, 1) * frameHeight}px`,
  };
}

export function getPokemonSpriteMetadata(animationName: string | null | undefined): { frameWidth: number; frameHeight: number; frameCount: number; durations: number[] } {
  const resolved = normalizePokemonAnimationName(animationName ?? "Idle") ?? "Idle";
  return SPRITE_ANIMATION_METADATA[resolved] ?? SPRITE_ANIMATION_METADATA.Idle;
}

export function getPokemonAnimationMetadataForXml(xmlText: string, animationName: string | null | undefined): PokemonAnimationMetadata | null {
  const normalizedName = normalizePokemonAnimationName(animationName ?? "Idle") ?? "Idle";
  const animations = parseSpriteAnimationXml(xmlText);
  return animations.find((animation) => animation.name === normalizedName) ?? animations[0] ?? null;
}

export type PokemonAnimationInstance = {
  startAnimation: (animationOrState?: string | null, loopOrOptions?: boolean | PokemonAnimationOptions) => string | null;
  pauseAnimation: () => string | null;
  stopAnimation: () => string | null;
  getCurrentAnimation: () => string | null;
  isAnimationPlaying: (animationName?: string | null) => boolean;
  isLooping: () => boolean;
  isIdleHoldingFrame: () => boolean;
  getCurrentState: () => string | null;
};

export class PokemonAnimationController implements PokemonAnimationInstance {
  private readonly stateMap: Record<string, string>;
  private currentAnimation: string | null = null;
  private currentState: string | null = null;
  private isPlayingFlag = false;
  private loopEnabled = true;
  private idleFrameHeld = false;
  private readonly idleChance: number;

  constructor(
    stateMap: Record<string, string> = DEFAULT_POKEMON_ANIMATION_STATE_MAP,
    idleChance = DEFAULT_IDLE_ANIMATION_CHANCE,
  ) {
    this.stateMap = stateMap;
    this.idleChance = idleChance;
  }

  startAnimation(animationOrState: string | null | undefined, loopOrOptions: boolean | PokemonAnimationOptions = true): string | null {
    const options = typeof loopOrOptions === "boolean" ? { loop: loopOrOptions } : loopOrOptions ?? {};
    const loop = options.loop ?? true;
    const resolved = this.resolveAnimation(animationOrState ?? options.state ?? this.currentState);
    if (!resolved) {
      return null;
    }

    this.currentAnimation = resolved;
    this.currentState = this.getStateForAnimation(resolved) ?? this.currentState;
    this.isPlayingFlag = true;
    this.loopEnabled = loop;
    this.idleFrameHeld = this.shouldHoldIdleFrame(resolved, options.idleChance ?? this.idleChance);
    return resolved;
  }

  pauseAnimation(): string | null {
    if (!this.currentAnimation) {
      return null;
    }

    this.isPlayingFlag = false;
    return this.currentAnimation;
  }

  stopAnimation(): string | null {
    const previous = this.currentAnimation;
    this.currentAnimation = null;
    this.currentState = null;
    this.isPlayingFlag = false;
    this.loopEnabled = true;
    this.idleFrameHeld = false;
    return previous;
  }

  getCurrentAnimation(): string | null {
    return this.currentAnimation;
  }

  getCurrentState(): string | null {
    return this.currentState ?? null;
  }

  isAnimationPlaying(animationName?: string | null): boolean {
    if (!this.currentAnimation) {
      return false;
    }

    if (!this.isPlayingFlag) {
      return false;
    }

    if (!animationName) {
      return true;
    }

    const resolved = this.resolveAnimation(animationName);
    return resolved === this.currentAnimation;
  }

  isLooping(): boolean {
    return this.loopEnabled;
  }

  isIdleHoldingFrame(): boolean {
    return this.idleFrameHeld && this.currentAnimation === "Idle";
  }

  private shouldHoldIdleFrame(animationName: string | null, chance: number): boolean {
    if (animationName !== "Idle") {
      return false;
    }

    return !shouldPlayIdleAnimation(Math.random(), chance);
  }

  private getStateForAnimation(animationName: string): string | null {
    const entry = Object.entries(this.stateMap).find(([, value]) => value === animationName);
    return entry?.[0] ?? null;
  }

  private resolveAnimation(animationOrState: string | null | undefined): string | null {
    if (!animationOrState) {
      return null;
    }

    const directMatch = normalizePokemonAnimationName(animationOrState);
    if (directMatch) {
      return directMatch;
    }

    const mapped = getPokemonAnimationForState(animationOrState);
    if (mapped) {
      return mapped;
    }

    const candidate = Object.entries(this.stateMap).find(([key, value]) => {
      const withoutNoise = key.toLowerCase().replace(/[^a-z]/g, "");
      const withoutNoiseTarget = animationOrState.toLowerCase().replace(/[^a-z]/g, "");
      return withoutNoise === withoutNoiseTarget || value.toLowerCase() === animationOrState.toLowerCase();
    });

    return candidate?.[1] ?? null;
  }
}

export function createPokemonAnimationObject(
  stateMap: Record<string, string> = DEFAULT_POKEMON_ANIMATION_STATE_MAP,
  idleChance = DEFAULT_IDLE_ANIMATION_CHANCE,
): PokemonAnimationInstance {
  return new PokemonAnimationController(stateMap, idleChance);
}
