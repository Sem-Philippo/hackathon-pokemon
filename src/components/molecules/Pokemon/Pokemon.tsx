"use client";

import { useEffect, useRef, useState } from "react";
import { type Position } from "@/components/types/Draggable";
import { PokemonAction, type PokemonData } from "@/components/types/Pokemon";
import "@/components/molecules/Pokemon/Pokemon.css";
import { Draggable } from "@/components/atoms/Draggable/Draggable";
import PhysicsObject from "@/components/atoms/PhysicsObject/PhysicsObject";
import { FoodItem, Item, ItemType } from "@/components/types/Items";

type PokemonProps = {
    maxX: number;
    maxY: number;
    floorY: number;
    itemExists: (itemNames: string | string[]) => boolean;
    getItems: (itemNames: string | string[]) => Item[];
    deleteItem: (item: Item) => void;
};

const Pokemon = function Pokemon({ maxX, maxY, floorY, itemExists, getItems, deleteItem }: PokemonProps) {
    const minActionTime = 2000;
    const maxActionTime = 5000;

    const pokemonDebug = true;

    // No need to update the DOM every time hunger updates
    const [hunger, setHunger] = useState(50);
    const hungerTick = 1;
    const maxHunger = 100;
    const hungerTickSpeed = 1000;

    const interactDistance = 10;

    const [width, setWidth] = useState(100);
    const [height, setHeight] = useState(100);
    const adjMaxX = maxX - width;
    const adjMaxY = maxY - height;
    const pokemonRef = useRef<HTMLDivElement>(null);
    const [currentAction, setCurrentAction] = useState<PokemonAction>(PokemonAction.None);
    const [data] = useState<PokemonData>({
        hp: 100,
        atk: 10,
        spAtk: 10,
        def: 10,
        spDef: 10,
        speed: 255,
        weight: 100,
        canFly: true,
        likedFood: FoodItem.Sitrus_Berry,
        dislikedFood: FoodItem.Oran_Berry,
        name: crypto.randomUUID(),
    });

    const [claimedItem, setClaimedItem] = useState<Item>();

    const startedUp = useRef<boolean>(false);
    const initialResize = useRef<boolean>(false);

    const neutralFoodsObject = Object.values(FoodItem).filter((value) => typeof value == 'number' && value !== data.likedFood && value !== data.dislikedFood);
    const neutralFoods = neutralFoodsObject.map((value: string | FoodItem) => {if (typeof value == 'number') {return FoodItem[value]}})

    const pokemonActions = [
    PokemonAction.Move,
    PokemonAction.Idle,
    ...(data.canFly
        ? [
            PokemonAction.Flying,
            PokemonAction.Landing,
        ]
        : []),
    ...(hunger <= maxHunger * 0.75 && itemExists(FoodItem[data.likedFood]) && !claimedItem ? [
        PokemonAction.SlightlyHungry,
    ] : []),
    ...(hunger <= maxHunger * 0.5 && itemExists(neutralFoods) && !claimedItem ? [
        PokemonAction.Hungry,
    ] : []),
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
            if (!startedUp.current) {
                startedUp.current = true;
                action = PokemonAction.Idle;
            }
            else if (!initialResize.current) {
                initialResize.current = true;
                action = PokemonAction.Idle;
            }

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
                }
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

                if (pokemonDebug) {
                    console.log("New target:", targetPosition.current);
                }
               
            }
            else if (action === PokemonAction.Idle) {
                if (!data.canFly) {
                    targetPosition.current.y = floorY;
                }
            }
            else if (action === PokemonAction.SlightlyHungry) {
                const likedFoodItems = getItems(FoodItem[data.likedFood]);

                likedFoodItems.forEach(item => {
                    if (!item.claimedBy) {
                        item.claimedBy = data.name;
                        console.log("item claimed by", item.claimedBy);

                        setClaimedItem(item);

                        targetPosition.current = item.position;
                    }
                });
            }

            if (pokemonDebug) {
                console.log("setting current action to ", action); 
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
    }, [maxX, maxY, isDragging, pokemonActions]);

    useEffect(() => {
        const resizeObserver = new ResizeObserver((event) => {
            setWidth(event[0].contentBoxSize[0].inlineSize);
            setHeight(event[0].contentBoxSize[0].blockSize);
        });

        resizeObserver.observe(pokemonRef.current as Element);

        // Hunger loop
        const intervalId = setInterval(() => setHunger(prev => Math.max(prev - hungerTick, 0)), hungerTickSpeed)

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {if (pokemonDebug) {console.log("hunger is now", hunger)}}, [hunger]);

    function updatePosition(position: Position) {
        setDisplayPosition(position);

        checkItemOverlap(position);
    }

    function checkItemOverlap(position: Position) {
        if (!claimedItem) {
            // No item to check overlap for
            return; 
        }

        const dx = Math.abs((claimedItem.position.x + claimedItem.size.width / 2) - (position.x + width / 2)) - claimedItem.size.width / 2 - width / 2;
        const dy = Math.abs((claimedItem.position.y + claimedItem.size.height / 2) - (position.y + height / 2)) - claimedItem.size.height / 2 - height / 2;

        console.log(dx, dy);


        if (dx < 0 && dy < 0) {
            consumeItem(claimedItem);
        }
    }

    useEffect(() => console.log(claimedItem), [claimedItem]);

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

        setClaimedItem(undefined);
    }

    return (
        <div 
            className="w-10 h-10 pokemon" 
            ref={pokemonRef} 
            style={{
                left: displayPosition.x,
                top: displayPosition.y,
            }}
        >
            <PhysicsObject
                floorY={floorY}
                physicsPaused={isDragging}
                moveSpeed={data.speed}
                weight={200}
                hasGravity={!data.canFly}
                position={position}
                setDisplayPosition={updatePosition}
                targetPosition={targetPosition}
            >
                <Draggable 
                maxX={adjMaxX} 
                maxY={adjMaxY} 
                setDisplayPosition={updatePosition} 
                isDragging={isDragging} 
                setIsDragging={setIsDragging} 
                position={position} 
                onStop={stopDragging}>
                    <div
                        className="bg-red-500 w-full h-full"
                    />
                </Draggable>
            </PhysicsObject>
        </div>
        
    );
};

export { Pokemon };
export default Pokemon;