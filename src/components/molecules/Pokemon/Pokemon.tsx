"use client";

import { useEffect, useRef, useState } from "react";
import { type Position } from "@/components/types/Draggable";
import { PokemonAction, type PokemonData, type PokemonFacing } from "@/components/types/Pokemon";
import "@/components/molecules/Pokemon/Pokemon.css";
import { Draggable } from "@/components/atoms/Draggable/Draggable";

type PokemonProps = {
    maxX: number;
    maxY: number;
    floorY: number;
    data: PokemonData;
    showDebugInfo: boolean;
};

const Pokemon = function Pokemon({ maxX, maxY, floorY, data, showDebugInfo }: PokemonProps) {
    const minActionTime = 2000;
    const maxActionTime = 5000;
    const [width, setWidth] = useState(100);
    const [height, setHeight] = useState(100);
    const adjMaxX = maxX - width;
    const adjMaxY = maxY - height;
    const pokemonRef = useRef<HTMLDivElement>(null);
    const [currentAction, setCurrentAction] = useState<PokemonAction>(PokemonAction.None);
    const [facing, setFacing] = useState<PokemonFacing>("right");

    const startedUp = useRef<boolean>(false);
    const initialResize = useRef<boolean>(false);

    const pokemonActions = [
    PokemonAction.Move,
    PokemonAction.Idle,
    ...(data.canFly
        ? [
            PokemonAction.Flying,
            PokemonAction.Landing,
        ]
        : []),
];

    const [isDragging, setIsDragging] = useState(false);
    const wasDragging = useRef<boolean>(false);

    const timeoutId = useRef<ReturnType<typeof setTimeout>>(undefined);

    function stopDragging() {
        // Prevent pokemon from moving to target position after dragging
        targetPosition.current = { ...position.current };

        if (!data.canFly) {
            targetPosition.current.y = floorY;
        }
    }

    const [displayPosition, setDisplayPosition] = useState<Position>({
        x: 0,
        y: floorY,
    });

    const position = useRef<Position>({
        x: 0,
        y: 100,
    });

    const targetPosition = useRef<Position>({
        x: 0,
        y: floorY,
    });

    // Action loop
    useEffect(() => {

        function chooseAction() {
            let validAction = false;
            let action: PokemonAction = PokemonAction.Idle;
            while (!validAction) {
                console.log(pokemonActions.length);
                action = pokemonActions[Math.floor(Math.random() * pokemonActions.length)];
                validAction = true;
                // If the pokemon is already flying, don't fly again
                if (action === PokemonAction.Flying && position.current.y < floorY) {
                    validAction = false;
                }
                // If the pokemon is already on the ground, don't land again
                else if (action === PokemonAction.Landing && position.current.y >= floorY) {
                    validAction = false;
                }
            }
            console.log(startedUp, initialResize);
            if (!startedUp.current) {
                startedUp.current = true;
                console.log("startup");
                action = PokemonAction.Idle;
            }
            else if (!initialResize.current) {
                initialResize.current = true;
                console.log("resized");
                action = PokemonAction.Idle;
            }

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
            }

            
            if (action === PokemonAction.Move || action === PokemonAction.Flying || action === PokemonAction.Landing) {
                const newX = Math.floor(Math.random() * (maxX - width));

                let newY = floorY;

                // If the pokemon is already in the air, let it move around in the air while flying or moving
                if (action === PokemonAction.Flying || (action === PokemonAction.Move && data.canFly && position.current.y < floorY)) {
                    newY = Math.floor(Math.random() * maxY - height);
                }
                targetPosition.current = {
                    x: newX,
                    y: newY,
                };

                console.log("New target:", targetPosition.current);
            }
            else if (action === PokemonAction.Idle) {
                if (!data.canFly) {
                    targetPosition.current.y = floorY;
                }
            }

            console.log("setting current action to ", action);
            setCurrentAction(action);

            const delay = Math.floor(Math.random() * (maxActionTime - minActionTime + 1)) + minActionTime;

            timeoutId.current = setTimeout(chooseAction, delay);
        }

        function waitBeforeAction() {
            const delay = Math.floor(Math.random() * (maxActionTime - minActionTime + 1)) + minActionTime;

            timeoutId.current = setTimeout(chooseAction, delay);
        }

        if (!wasDragging.current && !isDragging) {
            chooseAction();
        }
        else {
            waitBeforeAction();
        }

        if (isDragging) {
            clearTimeout(timeoutId.current);
        }

        wasDragging.current = isDragging;

        return () => {
            clearTimeout(timeoutId.current);
        };
    }, [maxX, maxY, isDragging]);

    // Movement loop
    useEffect(() => {
        let animationFrame: number;
        let lastTime = performance.now();

        function movePokemon(currentTime: number) {
            const deltaTime = (currentTime - lastTime) / 1000;
            lastTime = currentTime;

            if (!isDragging) {

                const currentPosition = position.current;
                const target = targetPosition.current;

                const dx = target.x - currentPosition.x;
                const dy = target.y - currentPosition.y;

                const distance = Math.hypot(dx, dy);

                if (distance > 0) {
                    setFacing(dx < 0 ? "left" : "right");
                    const movement = data.speed * deltaTime;
                    const weightReduction = data.weight * deltaTime;
                    if (distance <= movement) {
                        position.current = {
                            x: target.x,
                            y: target.y,
                        };
                    } else {
                        position.current = {
                            x: currentPosition.x + (dx / distance) * movement,
                            y: dy < 0 ? 
                            currentPosition.y + (dy / distance) * (movement - weightReduction) : // Move slower upwards
                            currentPosition.y + (dy / distance) * (2 * movement + weightReduction), // Move quicker downwards
                        };
                    }

                    setDisplayPosition(position.current);
                }
            }
            if (position.current.y > floorY) {
                console.log("below the floor");
                console.log(floorY);
                position.current.y = floorY;
                setDisplayPosition(position.current);
            }

            animationFrame = requestAnimationFrame(movePokemon);
        }

        animationFrame = requestAnimationFrame(movePokemon);

        return () => {
            cancelAnimationFrame(animationFrame);
        };
    }, [data.speed, isDragging, floorY]);

    useEffect(() => {
        const resizeObserver = new ResizeObserver((event) => {
            setWidth(event[0].contentBoxSize[0].inlineSize);
            setHeight(event[0].contentBoxSize[0].blockSize);
        });

        resizeObserver.observe(pokemonRef.current as Element);
    }, []);

    return (
        <div 
            className="w-10 h-10 pokemon" 
            ref={pokemonRef} 
            data-facing={facing}
            data-pokemon-id={data.id}
            style={{
                left: displayPosition.x,
                top: displayPosition.y,
            }}
        >
            {showDebugInfo && (
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-black/75 px-1.5 py-1 text-center text-[10px] leading-tight text-white">
                    <div>{data.name} (#{data.id})</div>
                    <div>Type: {data.types.join(" / ") || "unknown"}</div>
                    <div>Facing: {facing}</div>
                </div>
            )}
            <Draggable 
                maxX={adjMaxX} 
                maxY={adjMaxY} 
                setDisplayPosition={setDisplayPosition} 
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
                    className="bg-red-500 w-full h-full"
                />
            </Draggable>
        </div>
        
    );
};

export { Pokemon };
export default Pokemon;