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

    crypto.randomUUID()

    const pokemon = Array.from({length: 10}, (_, i) => i);

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
            }])
        }
        console.log(items);
        
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
        {pokemon.map((i) => <Pokemon maxX={width} maxY={height} floorY={floorY} key={i}/>)}
        {items.map((item) => <GameItem maxX={width} maxY={height} floorY={floorY} key={item.uuid} itemData={item}/>)}
    </div>
  );
};

export { PlayArea };
export default PlayArea;
