"use client";

import { useEffect, useRef, useState } from "react";
import "@/components/molecules/Pokemon/Pokemon.css";

const enum PokemonAction {
    Move,
    Idle,
    Flying,
    Landing,
}

type PokemonProps = {
    maxX: number;
    maxY: number;
    floorY: number;
};

type Position = {
    x: number;
    y: number;
};

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

const Pokemon = function Pokemon({ maxX, maxY, floorY }: PokemonProps) {
    const minActionTime = 2000;
    const maxActionTime = 5000;
    const [width, setWidth] = useState(100);
    const [height, setHeight] = useState(100);
    const pokemonRef = useRef<HTMLDivElement>(null);
    const [currentAction, setCurrentAction] = useState<PokemonAction>(PokemonAction.Idle);
    const [data] = useState<PokemonData>({
        hp: 100,
        atk: 10,
        spAtk: 10,
        def: 10,
        spDef: 10,
        speed: 255,
        weight: 100,
        canFly: false,
    });

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
    const dragOffset = useRef<Position>({ x: 0, y: 0 });

    const timeoutId = useRef<ReturnType<typeof setTimeout>>(undefined);

    function startDragging(event: React.MouseEvent) {
        setIsDragging(true);

        dragOffset.current = {
            x: event.clientX - position.current.x,
            y: event.clientY - position.current.y,
        };
    }

    function stopDragging() {
        setIsDragging(false);

        // Prevent pokemon from moving to target position after dragging
        targetPosition.current = { ...position.current };

        if (!data.canFly) {
            targetPosition.current.y = floorY;
        }

        // Set action to idle for a while after dragging stops
    }


    const [displayPosition, setDisplayPosition] = useState<Position>({
        x: 100,
        y: 100,
    });

    const position = useRef<Position>({
        x: 100,
        y: 100,
    });

    const targetPosition = useRef<Position>({
        x: 100,
        y: 100,
    });

    // Action loop
    useEffect(() => {

        function chooseAction() {
            let validAction = false;
            let action: PokemonAction = PokemonAction.Idle;
            while (!validAction) {
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
                const newX = Math.floor(Math.random() * maxX - width);

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
                            currentPosition.y + (dy / distance) * movement + weightReduction : // Move quicker downwards
                            currentPosition.y + (dy / distance) * (movement - weightReduction), // Move slower upwards
                        };
                    }

                    setDisplayPosition(position.current);
                }
            }

            animationFrame = requestAnimationFrame(movePokemon);
        }

        animationFrame = requestAnimationFrame(movePokemon);

        return () => {
            cancelAnimationFrame(animationFrame);
        };
    }, [data.speed, isDragging]);

    // Drag loop
    useEffect(() => {
        function handleMouseMove(event: MouseEvent) {
            if (isDragging) {
                const newX = Math.max(Math.min(event.clientX - dragOffset.current.x, maxX - width), 0);
                const newY = Math.max(Math.min(event.clientY - dragOffset.current.y, maxY - height), 0);

                    position.current = {
                        x: newX,
                        y: newY,
                    };

                    setDisplayPosition(position.current);
            }
        }

        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
        }
    },[isDragging]);

    useEffect(() => {
        const resizeObserver = new ResizeObserver((event) => {
            setWidth(event[0].contentBoxSize[0].inlineSize);
            setHeight(event[0].contentBoxSize[0].blockSize);
        });

        resizeObserver.observe(pokemonRef.current as Element);
    }, []);

    return (
        <div
            className="bg-red-500 w-10 h-10 pokemon"
            style={{
                left: displayPosition.x,
                top: displayPosition.y,
            }}
            onMouseDown={(e) => {startDragging(e)}}
            onMouseUp={() => {stopDragging()}}
            ref={pokemonRef}
        />
    );
};

export { Pokemon };
export default Pokemon;