"use client";

import { useRef, useState } from "react";
import { type Position } from "@/components/types/Draggable";
import "@/components/molecules/GameItem/GameItem.css";
import { Draggable } from "@/components/atoms/Draggable/Draggable";
import { Item } from "@/components/types/Items";
import PhysicsObject from "@/components/atoms/PhysicsObject/PhysicsObject";

type GameItemProps = {
    maxX: number;
    maxY: number;
    floorY: number;
    itemData: Item;
    changePosition: (uuid: string, position: Position) => void;
};

const GameItem = function GameItem({ maxX, maxY, floorY, itemData, changePosition }: GameItemProps) {

    const [width, setWidth] = useState(itemData.size.width);
    const [height, setHeight] = useState(itemData.size.height);
    const adjMaxX = maxX - width;
    const adjMaxY = maxY - height;
    const itemRef = useRef<HTMLDivElement>(null);

    const [isDragging, setIsDragging] = useState(false);

    function stopDragging() {
        // Prevent pokemon from moving to target position after dragging
        targetPosition.current = { ...position.current };

        targetPosition.current.y = floorY;
    }

    const [displayPosition, setDisplayPosition] = useState<Position>({
        x: itemData.position.x,
        y: itemData.position.y,
    });

    const position = useRef<Position>({
        x: itemData.position.x,
        y: itemData.position.y,
    });

    const targetPosition = useRef<Position>({
        x: itemData.position.x,
        y: itemData.position.y,
    });

    function updatePosition(position: Position) {
        setDisplayPosition(position);

        changePosition(itemData.uuid, position);
    }

    return (
        <div 
            className="item" 
            ref={itemRef} 
            style={{
                left: displayPosition.x,
                top: displayPosition.y,
                width: width,
                height: height,
            }}
        >
            <PhysicsObject
                floorY={floorY}
                physicsPaused={isDragging}
                moveSpeed={0}
                weight={200}
                hasGravity
                position={position}
                updatePosition={updatePosition}
                targetPosition={targetPosition}
            >
                <Draggable 
                maxX={adjMaxX} 
                maxY={adjMaxY} 
                setDisplayPosition={setDisplayPosition} 
                isDragging={isDragging} 
                setIsDragging={setIsDragging} 
                position={position} 
                onStop={stopDragging}>
                <div
                    className="bg-green-500 w-full h-full"
                />
            </Draggable>
            </PhysicsObject>
            
        </div>
        
    );
};

export { GameItem };
export default GameItem;