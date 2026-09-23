"use client";

import {GameItem} from "@/components/molecules/GameItem/GameItem";
import Pokemon from "@/components/molecules/Pokemon/Pokemon";
import "@/components/organisms/PlayArea/PlayArea.css";
import { Position } from "@/components/types/Draggable";
import { type QueuedItem, type Item } from "@/components/types/Items";
import { useEffect, useRef, useState } from "react";

type PlayAreaProps = {
    queuedItems: QueuedItem[],
    setQueuedItems: React.Dispatch<React.SetStateAction<QueuedItem[]>>,
}

const PlayArea = function PlayArea({queuedItems, setQueuedItems}: PlayAreaProps) {
    const [width, setWidth] = useState(100);
    const [height, setHeight] = useState(100);

    const floorY = height - 50;

    const playAreaRef = useRef<HTMLDivElement>(null);

    const [items, setItems] = useState<Item[]>([]);

    const pokemon = Array.from({length: 1}, (_, i) => i);

    function summonItem(event: React.MouseEvent) {
        const playAreaBounds = playAreaRef.current?.getBoundingClientRect();
        const mousePosition: Position = {
            x: event.clientX - (playAreaBounds?.left ?? 0),
            y: event.clientY - (playAreaBounds?.top ?? 0),
        }

        if (queuedItems.length == 0) {
            // No items to spawn
            return;
        }

        const copyArray = [...queuedItems];
    
        const firstItem = copyArray.shift();

        if (firstItem !== undefined) {
            setQueuedItems(copyArray);

            const position: Position = {
                x: mousePosition.x - firstItem.size.width / 2,
                y: mousePosition.y - firstItem.size.height / 2,
            }

            setItems((prev) => [...prev, 
            {
                name: firstItem.name,
                type: firstItem.type,
                size: firstItem.size,
                position: position,
                uuid: crypto.randomUUID(),
                wasUsed: false,
            }])
        }
        console.log(items);
        
    }

    function itemExists(itemNames: string | string[]) {
        console.log(itemNames, items);
        if (typeof itemNames === 'string') {
            return items.filter((item) => item.name == itemNames).length >= 1;
        }
        
        return items.filter((item) => item.name in itemNames).length >= 1;
    }

    function getItems(itemNames: string | string[]) {
        console.log(itemNames, items);
        if (typeof itemNames === 'string') {
            return items.filter((item) => item.name == itemNames);
        }
        
        return items.filter((item) => item.name in itemNames);
    }

    function deleteItem(item: Item) {
        setItems((prev) => prev.filter((prevItem) => prevItem.uuid != item.uuid));
    }

    useEffect(() => {
        const resizeObserver = new ResizeObserver((event) => {
            setWidth(event[0].contentBoxSize[0].inlineSize);
            setHeight(event[0].contentBoxSize[0].blockSize);
            console.log("PlayArea resized:", event[0].contentBoxSize[0].inlineSize, event[0].contentBoxSize[0].blockSize);
        });

        resizeObserver.observe(playAreaRef.current as Element);
    }, []);
    

  return (
    <div className="w-full h-full bg-amber-50 playArea" onMouseDown={summonItem} ref={playAreaRef}>
        {pokemon.map((i) => <Pokemon maxX={width} maxY={height} floorY={floorY} itemExists={itemExists} getItems={getItems} deleteItem={deleteItem} key={i}/>)}
        {items.map((item) => <GameItem maxX={width} maxY={height} floorY={floorY} key={item.uuid} itemData={item}/>)}
    </div>
  );
};

export { PlayArea };
export default PlayArea;
