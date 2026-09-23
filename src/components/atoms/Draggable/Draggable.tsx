"use client";

import { useEffect, useRef} from "react";
import { type Position } from "@/components/types/Draggable";
import "@/components/molecules/Pokemon/Pokemon.css";

type DraggableProps = {
    maxX: number;
    maxY: number;
    children: React.ReactNode;
    setDisplayPosition: (position: Position) => void;
    isDragging: boolean;
    setIsDragging: React.Dispatch<React.SetStateAction<boolean>>;
    position: React.RefObject<Position>;
    onStop?: () => void;
    onStart?: () => void;
};

const Draggable = function Draggable(
    { 
        maxX, 
        maxY, 
        children, 
        setDisplayPosition, 
        isDragging, 
        setIsDragging, 
        position, 
        onStop,
        onStart
    }: DraggableProps) {

    const dragOffset = useRef<Position>({ x: 0, y: 0 });

    function startDragging(event: React.MouseEvent) {
        setIsDragging(true);

        onStart?.();

        dragOffset.current = {
            x: event.clientX - position.current.x,
            y: event.clientY - position.current.y,
        };
    }

    function stopDragging() {
        setIsDragging(false);

        onStop?.();
    }

    // Drag loop
    useEffect(() => {
        function handleMouseMove(event: MouseEvent) {
            if (isDragging) {
                const newX = Math.max(Math.min(event.clientX - dragOffset.current.x, maxX), 0);
                const newY = Math.max(Math.min(event.clientY - dragOffset.current.y, maxY), 0);

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

    return (
        <div
            onMouseDown={(e) => {e.stopPropagation(); startDragging(e)}}
            onMouseUp={() => {stopDragging()}}
            className="bg-blue-300 w-full h-full"
        >
            {children}
        </div>
    );
};

export { Draggable };
export default Draggable;