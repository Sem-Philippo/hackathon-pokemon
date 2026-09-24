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

type TimeOfDay = "day" | "sunset" | "night";

function getTimeOfDay(date: Date): TimeOfDay {
    const totalMinutes = date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60;
    const nowYear = date.getFullYear();
    const dayOfYear = Math.floor(
        (Date.UTC(nowYear, date.getMonth(), date.getDate()) - Date.UTC(nowYear, 0, 0)) / 86400000,
    );
    const seasonalOffsetMinutes = Math.sin(((dayOfYear / 365) * Math.PI * 2) - Math.PI / 2) * 120;
    const sunriseMinutes = 360 + seasonalOffsetMinutes;
    const sunsetMinutes = 1080 - seasonalOffsetMinutes;
    const duskWindowMinutes = 30;

    if (totalMinutes > sunriseMinutes + duskWindowMinutes && totalMinutes < sunsetMinutes - duskWindowMinutes) {
        return "day";
    }

    if (
        (totalMinutes >= sunriseMinutes - duskWindowMinutes && totalMinutes <= sunriseMinutes + duskWindowMinutes) ||
        (totalMinutes >= sunsetMinutes - duskWindowMinutes && totalMinutes <= sunsetMinutes + duskWindowMinutes)
    ) {
        return "sunset";
    }

    return "night";
}

const PlayArea = function PlayArea({ pokemon, showDebugInfo, queuedItems, setQueuedItems }: PlayAreaProps) {
    const [width, setWidth] = useState(100);
    const [height, setHeight] = useState(100);
    const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(getTimeOfDay(new Date()));

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

    useEffect(() => {
        const timer = window.setInterval(() => {
            setTimeOfDay(getTimeOfDay(new Date()));
        }, 1000);

        return () => window.clearInterval(timer);
    }, []);

    const backgroundLayers = {
        day: { opacity: timeOfDay === "day" ? 1 : 0 },
        sunset: { opacity: timeOfDay === "sunset" ? 1 : 0 },
        night: { opacity: timeOfDay === "night" ? 1 : 0 },
    };

    return (
        <div className="playArea relative h-full w-full overflow-hidden" onMouseDown={summonItem} ref={playAreaRef}>
            <div
                className="absolute inset-0 bg-cover bg-center transition-opacity duration-[4500ms] ease-in-out"
                style={{
                    backgroundImage: 'url("/media/background/day.png")',
                    opacity: backgroundLayers.day.opacity,
                }}
            />
            <div
                className="absolute inset-0 bg-cover bg-center transition-opacity duration-[4500ms] ease-in-out"
                style={{
                    backgroundImage: 'url("/media/background/dusk.png")',
                    opacity: backgroundLayers.sunset.opacity,
                }}
            />
            <div
                className="absolute inset-0 bg-cover bg-center transition-opacity duration-[4500ms] ease-in-out"
                style={{
                    backgroundImage: 'url("/media/background/night.png")',
                    opacity: backgroundLayers.night.opacity,
                }}
            />
            <div className="absolute inset-0 bg-transparent" aria-live="polite" aria-atomic="true" />
            {pokemon.map((entry) => (
                <Pokemon
                    key={entry.PokemonUUID}
                    data={entry}
                    maxX={width}
                    maxY={height}
                    floorY={floorY}
                    showDebugInfo={showDebugInfo}
                    spawnPosition={entry.spawnPosition}
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
