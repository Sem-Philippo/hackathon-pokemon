"use client";

import { GameItem } from "@/components/molecules/GameItem/GameItem";
import Pokemon from "@/components/molecules/Pokemon/Pokemon";
import "@/components/organisms/PlayArea/PlayArea.css";
import { Position } from "@/components/types/Draggable";
import { type QueuedItem, type Item } from "@/components/types/Items";
import { useEffect, useRef, useState } from "react";
import { type PokemonData } from "@/components/types/Pokemon";

type PlayAreaProps = {
    pokemon: PokemonData[];
    showDebugInfo: boolean;
    queuedItems: QueuedItem[];
    setQueuedItems: React.Dispatch<React.SetStateAction<QueuedItem[]>>;
};

const PlayArea = function PlayArea({ pokemon, showDebugInfo, queuedItems, setQueuedItems }: PlayAreaProps) {
    const [width, setWidth] = useState(100);
    const [height, setHeight] = useState(100);

    const floorY = height - 50;
    const playAreaRef = useRef<HTMLDivElement>(null);
    const [items, setItems] = useState<Item[]>([]);

    function summonItem(event: React.MouseEvent) {
        event.stopPropagation();

        const playAreaBounds = playAreaRef.current?.getBoundingClientRect();
        const mousePosition: Position = {
            x: event.clientX - (playAreaBounds?.left ?? 0),
            y: event.clientY - (playAreaBounds?.top ?? 0),
        };

        if (queuedItems.length === 0) {
            return;
        }

        const copyArray = [...queuedItems];
        const firstItem = copyArray.shift();

        if (firstItem !== undefined) {
            setQueuedItems(copyArray);

            const position: Position = {
                x: mousePosition.x - firstItem.size.width / 2,
                y: mousePosition.y - firstItem.size.height / 2,
            };

            setItems((prev) => [...prev, {
                name: firstItem.name,
                type: firstItem.type,
                size: firstItem.size,
                position,
                uuid: crypto.randomUUID(),
                wasUsed: false,
            }]);
        }
    }

    function itemExists(itemNames: string | string[]) {
        if (typeof itemNames === "string") {
            return items.some((item) => item.name === itemNames);
        }

        return items.some((item) => itemNames.includes(item.name));
    }

    function getItems(itemNames: string | string[]) {
        if (typeof itemNames === "string") {
            return items.filter((item) => item.name === itemNames);
        }

        return items.filter((item) => itemNames.includes(item.name));
    }

    function deleteItem(item: Item) {
        setItems((prev) => prev.filter((prevItem) => prevItem.uuid !== item.uuid));
    }

    function changeItemPosition(uuid: string, newPosition: Position) {
        setItems((prev) => prev.map((item) => item.uuid === uuid ? { ...item, position: newPosition } : item));
    }

    useEffect(() => {
        const resizeObserver = new ResizeObserver((event) => {
            setWidth(event[0].contentBoxSize[0].inlineSize);
            setHeight(event[0].contentBoxSize[0].blockSize);
        });

        resizeObserver.observe(playAreaRef.current as Element);

        return () => resizeObserver.disconnect();
    }, []);

    return (
        <div className="w-full h-full bg-amber-50 playArea" onMouseDown={summonItem} ref={playAreaRef}>
            {pokemon.map((entry) => (
                <Pokemon
                    key={entry.PokemonUUID}
                    data={entry}
                    maxX={width}
                    maxY={height}
                    floorY={floorY}
                    showDebugInfo={showDebugInfo}
                    itemExists={itemExists}
                    getItems={getItems}
                    deleteItem={deleteItem}
                />
            ))}
            {items.map((item) => (
                <GameItem
                    key={item.uuid}
                    maxX={width}
                    maxY={height}
                    floorY={floorY}
                    itemData={item}
                    changePosition={changeItemPosition}
                />
            ))}
        </div>
    );
};

export { PlayArea };
export default PlayArea;
