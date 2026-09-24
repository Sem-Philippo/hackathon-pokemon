"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { type Position } from "@/components/types/Draggable";
import { PokemonAction, type PokemonData, type PokemonFacing } from "@/components/types/Pokemon";
import { createPokemonAnimationObject, getPokemonAnimationFrameStyle } from "@/lib/pokemonAnimations";
import "@/components/molecules/Pokemon/Pokemon.css";
import { Draggable } from "@/components/atoms/Draggable/Draggable";
import PhysicsObject from "@/components/atoms/PhysicsObject/PhysicsObject";
import { FoodItem, Item, ItemType } from "@/components/types/Items";

type PokemonProps = {
    maxX: number;
    maxY: number;
    floorY: number;
    data: PokemonData;
    spawnPosition?: "center" | "top";
    showDebugInfo: boolean;
    itemExists: (itemNames: string | string[]) => boolean;
    getItems: (itemNames: string | string[]) => Item[];
    deleteItem: (item: Item) => void;
};

const Pokemon = function Pokemon({ maxX, maxY, floorY, itemExists, getItems, deleteItem, data, showDebugInfo, spawnPosition = "center" }: PokemonProps) {
    const pokemonScale = 2;

    const animationControllerRef = useRef(createPokemonAnimationObject());
    const [currentActionState, setCurrentActionState] = useState<PokemonAction>(PokemonAction.None);
    const [currentAnimation, setCurrentAnimation] = useState<string | null>("Idle");
    const [animationFrame, setAnimationFrame] = useState(0);
    const [facing, setFacing] = useState<PokemonFacing>("right");
    const [spriteMeta, setSpriteMeta] = useState<{ frameWidth: number; frameHeight: number; frameCount: number; durations: number[]; sheetRows: number; sheetColumns: number } | null>(null);

    const spriteWidth = spriteMeta?.frameWidth ?? 32;
    const spriteHeight = spriteMeta?.frameHeight ?? 32;
    const spriteFrames = spriteMeta?.frameCount ?? 1;
    const spriteStyle = getPokemonAnimationFrameStyle(
        currentAnimation,
        facing,
        animationFrame,
        spriteWidth,
        spriteHeight,
        spriteFrames,
        spriteMeta?.sheetRows ?? 1,
        spriteMeta?.sheetColumns ?? spriteFrames,
    );
    const spritePath = `/media/sprites/sprite/${String(data.id).padStart(4, "0")}/${currentAnimation ?? "Idle"}-Anim.png`;

    const width = useMemo(() => spriteStyle.width * pokemonScale, [spriteStyle.width, pokemonScale]);
    const height = useMemo(() => spriteStyle.height * pokemonScale, [spriteStyle.height, pokemonScale]);

    const pokemonDebug = true;

    // No need to update the DOM every time hunger updates
    const [hunger, setHunger] = useState(50);
    const hungerTick = 1;
    const maxHunger = 100;
    const hungerTickSpeed = 1000;

    const adjMaxX = useMemo(() => maxX - width / 2, [maxX, width]);
    const adjMaxY = useMemo(() => maxY - height / 2, [maxY, height]);
    const adjFloorY = useMemo(() => floorY - spriteHeight / 2, [floorY, spriteHeight]);

    console.log(width, spriteStyle.width, height, spriteStyle.height);
    const currentAction = useRef<PokemonAction>(PokemonAction.None);

    const claimedItem = useRef<Item>(null);
    const [hasClaimed, setHasClaimed] = useState(false);

    const neutralFoods = useMemo(
        () => Object.values(FoodItem)
            .filter(
                (value): value is FoodItem =>
                    typeof value === "number" &&
                    value !== data.likedFood &&
                    value !== data.dislikedFood
            )
            .map((value) => FoodItem[value]),
        [data.dislikedFood, data.likedFood]
    );

    const pokemonActions = useMemo(() => [
        PokemonAction.Move,
        PokemonAction.Idle,
        ...(data.canFly
            ? [
                PokemonAction.Flying,
                PokemonAction.Landing,
            ]
            : []),
        ...(hunger <= maxHunger * 0.75 && itemExists(FoodItem[data.likedFood]) && !hasClaimed ? [
            PokemonAction.SlightlyHungry,
            PokemonAction.SlightlyHungry,
            PokemonAction.SlightlyHungry,
            PokemonAction.SlightlyHungry,
            PokemonAction.SlightlyHungry,
        ] : []),
        ...(hunger <= maxHunger * 0.5 && itemExists([FoodItem[data.likedFood], ...neutralFoods]) && !hasClaimed ? [
            PokemonAction.Hungry,
        ] : []),
        ...(hunger <= maxHunger * 0.2 && itemExists([FoodItem[data.likedFood], ...neutralFoods, FoodItem[data.dislikedFood]]) && !hasClaimed ? [
            PokemonAction.Starving,
        ] : []),
    ], [data.canFly, data.dislikedFood, data.likedFood, hasClaimed, hunger, itemExists, neutralFoods]);

    const [isDragging, setIsDragging] = useState(false);
    const wasDragging = useRef<boolean>(false);

    const timeoutId = useRef<ReturnType<typeof setTimeout>>(undefined);

    useEffect(() => {
        if (isDragging) {
            const pausedAnimation = animationControllerRef.current.pauseAnimation();
            if (pausedAnimation) {
                setCurrentAnimation(pausedAnimation);
            }
            return;
        }

        const isAirborne = data.canFly && position.current.y < adjFloorY;
        const animationState =
            currentActionState === PokemonAction.Idle ? "idle" :
            currentActionState === PokemonAction.Flying || currentActionState === PokemonAction.Landing ? "fly" :
            currentActionState === PokemonAction.Move ||
            currentActionState === PokemonAction.SlightlyHungry ||
            currentActionState === PokemonAction.Hungry ||
            currentActionState === PokemonAction.Starving ? (isAirborne ? "fly" : "walk") :
            null;

        if (!animationState) {
            const stoppedAnimation = animationControllerRef.current.stopAnimation();
            if (stoppedAnimation) {
                setCurrentAnimation(null);
            }
            return;
        }

        const nextAnimation = animationControllerRef.current.startAnimation(animationState, {
            loop: currentActionState !== PokemonAction.Idle,
            idleChance: 0.2,
        });

        if (nextAnimation) {
            setCurrentAnimation(nextAnimation);
            setAnimationFrame(0);
        }
    }, [currentActionState, data.canFly, adjFloorY, isDragging]);

    useEffect(() => {
        let cancelled = false;

        async function loadAnimationMetadata() {
            try {
                const response = await fetch(`/media/sprites/sprite/${String(data.id).padStart(4, "0")}/AnimData.xml`);
                if (!response.ok || cancelled) {
                    return;
                }

                const xml = await response.text();
                const parser = new DOMParser();
                const document = parser.parseFromString(xml, "application/xml");
                const anims = Array.from(document.querySelectorAll("Anim"));
                const target = anims.find((node) => node.querySelector("Name")?.textContent === currentAnimation) ?? anims[0];
                if (!target || cancelled) {
                    return;
                }

                const name = target.querySelector("Name")?.textContent ?? currentAnimation ?? "Idle";
                const frameWidth = Number(target.querySelector("FrameWidth")?.textContent ?? 32);
                const frameHeight = Number(target.querySelector("FrameHeight")?.textContent ?? 32);
                const durations = Array.from(target.querySelectorAll("Duration"))
                    .map((node) => Number(node.textContent ?? "0") * (1000 / 60))
                    .filter((value) => Number.isFinite(value) && value > 0);
                const frameCount = Math.max(durations.length || 1, 1);
                const image = new Image();
                image.onload = () => {
                    if (cancelled) {
                        return;
                    }

                    const sheetColumns = Math.max(1, Math.round(image.naturalWidth / frameWidth));
                    const sheetRows = Math.max(1, Math.round(image.naturalHeight / frameHeight));
                    setSpriteMeta({
                        frameWidth,
                        frameHeight,
                        frameCount: Math.min(frameCount, sheetColumns),
                        durations: durations.length ? durations : [1000 / 60],
                        sheetRows,
                        sheetColumns,
                    });
                };
                image.src = `/media/sprites/sprite/${String(data.id).padStart(4, "0")}/${name}-Anim.png`;
            } catch {
                if (cancelled) {
                    return;
                }
            }
        }

        void loadAnimationMetadata();

        return () => {
            cancelled = true;
        };
    }, [currentAnimation, data.id]);

    useEffect(() => {
        if (!currentAnimation || isDragging || !spriteMeta) {
            return;
        }

        if (spriteMeta.frameCount <= 1) {
            return;
        }

        const frameDuration = spriteMeta.durations[Math.min(animationFrame, spriteMeta.durations.length - 1)] ?? 100;
        const timer = window.setTimeout(() => {
            setAnimationFrame((previous) => {
                const totalFrames = spriteMeta.frameCount;
                if (animationControllerRef.current.isLooping()) {
                    return (previous + 1) % totalFrames;
                }

                return Math.min(previous + 1, totalFrames - 1);
            });
        }, frameDuration);

        return () => window.clearTimeout(timer);
    }, [animationFrame, currentAnimation, isDragging, spriteMeta]);

    function stopDragging() {
        // Prevent pokemon from moving to target position after dragging
        targetPosition.current = { ...position.current };
        currentAction.current = PokemonAction.None;
        setCurrentActionState(PokemonAction.None);

        if (!data.canFly) {
            targetPosition.current.y = adjFloorY;
        }
    }

    const [displayPosition, setDisplayPosition] = useState<Position>({
        x: 0,
        y: adjFloorY,
    });

    const position = useRef<Position>({
        x: 0,
        y: adjFloorY,
    });

    const targetPosition = useRef<Position>({
        x: 0,
        y: adjFloorY,
    });

    const [hasInitializedPosition, setHasInitializedPosition] = useState(false);

    useEffect(() => {
        if (hasInitializedPosition || maxX <= 100 || maxY <= 100) {
            return;
        }

        const initialPosition = {
            x: Math.max(0, (maxX - width) / 2),
            y: spawnPosition === "top" ? 0 : Math.max(0, (maxY - height) / 2),
        };

        position.current = initialPosition;
        targetPosition.current = initialPosition;
        setDisplayPosition(initialPosition);
        setHasInitializedPosition(true);
    }, [hasInitializedPosition, height, maxX, maxY, spawnPosition, width]);

    // Action loop
    useEffect(() => {
        function chooseAction() {
            let validAction = false;
            let action: PokemonAction = PokemonAction.Idle;
            while (!validAction) {
                action = pokemonActions[Math.floor(Math.random() * pokemonActions.length)];
                validAction = true;
                // If the pokemon is already flying, don't fly again
                if (action === PokemonAction.Flying && position.current.y < adjFloorY) {
                    validAction = false;
                }
                // If the pokemon is already on the ground, don't land again
                else if (action === PokemonAction.Landing && position.current.y >= adjFloorY) {
                    validAction = false;
                }
            }

            currentAction.current = action;
            setCurrentActionState(action);

            if (pokemonDebug) {
                switch (action) {
                    case PokemonAction.Idle:
                        console.log("Pokemon is idling");
                        break;
                    case PokemonAction.Move:
                        console.log("Pokemon is moving");
                        break;
                    case PokemonAction.Flying:
                        console.log("Pokemon is flying");
                        break;
                    case PokemonAction.Landing:
                        console.log("Pokemon is landing");
                        break;
                    case PokemonAction.SlightlyHungry:
                        console.log("Pokemon is slightly hungry");
                        break;
                    case PokemonAction.Hungry:
                        console.log("Pokemon is hungry");
                        break;
                    case PokemonAction.Starving:
                        console.log("Pokemon is starving");
                        break;
                }
            }
            
            if (action === PokemonAction.Move || action === PokemonAction.Flying || action === PokemonAction.Landing) {
                const newX = Math.floor(Math.random() * adjMaxX);

                let newY = adjFloorY;

                // If the pokemon is already in the air, let it move around in the air while flying or moving
                if (action === PokemonAction.Flying || (action === PokemonAction.Move && data.canFly && position.current.y < adjFloorY)) {
                    newY = Math.max(Math.floor(Math.random() * adjMaxY), height);
                }
                targetPosition.current = {
                    x: newX,
                    y: newY,
                };

                if (pokemonDebug) {
                    console.log("New target:", targetPosition.current);
                }
               
            }
            else if (action === PokemonAction.Idle) {
                if (!data.canFly) {
                    targetPosition.current.y = adjFloorY;
                }
            }
            else if (action === PokemonAction.SlightlyHungry) {
                console.log("trying to claim");
                const likedFoodItems = getItems(FoodItem[data.likedFood]);

                likedFoodItems.forEach(item => {
                    if (!item.claimedBy) {
                        item.claimedBy = data.PokemonUUID;
                        console.log("item claimed by", item.claimedBy);

                        claimedItem.current = item;
                        setHasClaimed(true);

                        targetPosition.current = item.position;
                        return;
                    }
                });
            }
            else if (action === PokemonAction.Hungry) {
                const foodItems = getItems([FoodItem[data.likedFood], ...neutralFoods]);

                foodItems.forEach(item => {
                    if (!item.claimedBy) {
                        console.log("test");
                        item.claimedBy = data.PokemonUUID;
                        console.log("item claimed by", item.claimedBy);

                        claimedItem.current = item;
                        setHasClaimed(true);

                        targetPosition.current = item.position;
                        return;
                    }
                    else {
                        console.log("can't claim");
                    }
                });
            }
            else if (action === PokemonAction.Starving) {
                const foodItems = getItems([FoodItem[data.likedFood], ...neutralFoods, FoodItem[data.dislikedFood]]);

                foodItems.forEach(item => {
                    if (!item.claimedBy) {
                        item.claimedBy = data.PokemonUUID;
                        console.log("item claimed by", item.claimedBy);

                        claimedItem.current = item;
                        setHasClaimed(true);

                        targetPosition.current = item.position;
                    }
                });
            }

            if (pokemonDebug) {
                console.log("setting current action to ", action); 
            }

            timeoutId.current = setTimeout(waitBeforeAction, 100);
        }

        function waitBeforeAction() {
            console.log("waiting", currentAction.current);
            if (currentAction.current === PokemonAction.None) {
                timeoutId.current = setTimeout(chooseAction, 100);
            }
            else {
                timeoutId.current = setTimeout(waitBeforeAction, 100);
            }
        }

        if (hasInitializedPosition && !wasDragging.current && !isDragging && currentAction.current === PokemonAction.None) {
            chooseAction();
        }
        else if (wasDragging.current){
            waitBeforeAction();
        }

        if (isDragging) {
            console.log("running cleanup kinda");
            clearTimeout(timeoutId.current);
        }

        wasDragging.current = isDragging;

        return () => {
            console.log("running cleanup");
            clearTimeout(timeoutId.current);
        };
    }, [data.PokemonUUID, data.canFly, data.dislikedFood, data.likedFood, adjFloorY, getItems, hasInitializedPosition, height, isDragging, adjMaxX, adjMaxY, neutralFoods, pokemonActions, pokemonDebug, width, currentAction, currentActionState]);

    useEffect(() => {
        // Hunger loop
        const intervalId = setInterval(() => setHunger(prev => Math.max(prev - hungerTick, 0)), hungerTickSpeed)

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {if (pokemonDebug) {console.log("hunger is now", hunger)}}, [hunger, pokemonDebug]);

    function updatePosition(nextPosition: Position) {
        setDisplayPosition((previousPosition) => {
            if (previousPosition.x !== nextPosition.x) {
                setFacing(nextPosition.x < previousPosition.x ? "left" : "right");
            }
            return nextPosition;
        });

        checkItemOverlap(nextPosition);
    }

    function checkItemOverlap(position: Position) {
        if (!claimedItem.current) {
            // No item to check overlap for
            return; 
        }

        const dx = Math.abs((claimedItem.current.position.x + claimedItem.current.size.width / 2) - (position.x + width / 2)) - claimedItem.current.size.width / 2 - width / 2;
        const dy = Math.abs((claimedItem.current.position.y + claimedItem.current.size.height / 2) - (position.y + height / 2)) - claimedItem.current.size.height / 2 - height / 2;

        if (dx < 0 && dy < 0) {
            consumeItem(claimedItem.current);
        }
    }

    useEffect(() => console.log(claimedItem), [claimedItem]);

    useEffect(() => {
        console.log("action changed to", currentAction);
        if (currentAction.current === PokemonAction.Idle) {
            setTimeout(() => {currentAction.current = PokemonAction.None; setCurrentActionState(PokemonAction.None); console.log("Allowing actions");}, 1000)
        }
        
    }, [currentAction, currentActionState])

    function consumeItem(item: Item) {
        // remove from array
        // Do stuff based on item type
        if (!item.wasUsed) {
            switch (item.type) {
                case ItemType.food:
                    setHunger((prev) => prev + maxHunger * 0.2);
                    break;
                case ItemType.heldItem:
                    // Equip item logic
                    break;
                case ItemType.evolutionItem:
                    // evolve logic
                    break;
            }
        }
        
        deleteItem(item);

        item.wasUsed = true;

        claimedItem.current = null;
        setHasClaimed(false);
    }

    function handleMovementComplete() {
        currentAction.current = PokemonAction.Idle;
        setCurrentActionState(PokemonAction.Idle);
    }

    return (
        <div 
            className="pokemon" 
            data-facing={facing}
            data-pokemon-id={data.PokemonUUID}
            style={{
                left: displayPosition.x,
                top: displayPosition.y,
                width: spriteStyle.width,
                height: spriteStyle.height,
                scale: pokemonScale,
            }}
        >
            <PhysicsObject
                floorY={adjFloorY}
                physicsPaused={isDragging}
                moveSpeed={data.speed}
                weight={200}
                hasGravity={!data.canFly}
                position={position}
                updatePosition={updatePosition}
                targetPosition={targetPosition}
                onMovementComplete={handleMovementComplete}
            >
                {showDebugInfo && (
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-black/75 px-1.5 py-1 text-center text-[10px] leading-tight text-white">
                    <div>{data.name} (#{data.id})</div>
                    <div>Type: {data.types.join(" / ") || "unknown"}</div>
                    <div>Facing: {facing}</div>
                    <div>Anim: {currentAnimation ?? "none"}</div>
                </div>
            )}
            <Draggable 
                maxX={adjMaxX} 
                maxY={adjMaxY} 
                setDisplayPosition={updatePosition} 
                isDragging={isDragging} 
                setIsDragging={setIsDragging} 
                position={position} 
                onStop={stopDragging}
                onMove={(nextPosition, previousPosition) => {
                    if (nextPosition.x !== previousPosition.x) {
                        setFacing(nextPosition.x < previousPosition.x ? "left" : "right");
                    }
                }}>
                    <div
                        className="sprite-sheet"
                    style={{
                        width: spriteStyle.width,
                        height: spriteStyle.height,
                        visibility: spriteMeta ? "visible" : "hidden",
                        backgroundImage: `url("${spritePath}")`,
                        backgroundPosition: spriteStyle.backgroundPosition,
                        backgroundSize: spriteStyle.backgroundSize,
                        imageRendering: "pixelated",
                        backgroundRepeat: "no-repeat",
                    }}
                    />
                </Draggable>
            </PhysicsObject>
        </div>
    );
};

export { Pokemon };
export default Pokemon;