"use client";

import { useEffect, useRef, useState } from "react";
import { type Position } from "@/components/types/Draggable";
import { PokemonAction, type PokemonData } from "@/components/types/Pokemon";
import "@/components/molecules/Pokemon/Pokemon.css";
import { Draggable } from "@/components/atoms/Draggable/Draggable";
import { Item } from "@/components/types/Items";

type PhysicsObjectProps = {
    floorY: number;
    children: React.ReactNode;
    physicsPaused: boolean;
    moveSpeed: number;
    weight: number;
    hasGravity: boolean;
    position: React.RefObject<Position>;    
    updatePosition: (position: Position) => void;
    targetPosition: React.RefObject<Position>;
};

const PhysicsObject = function PhysicsObject(
    {  
        floorY,
        children, 
        hasGravity = true,
        physicsPaused = false,
        moveSpeed = 0,
        weight = 100,
        updatePosition, 
        position, 
        targetPosition,
    }: PhysicsObjectProps) {

    // Movement loop
    useEffect(() => {
        let animationFrame: number;
        let lastTime = performance.now();

        function moveObject(currentTime: number) {
            const deltaTime = (currentTime - lastTime) / 1000;
            lastTime = currentTime;

            if (!physicsPaused) {

                if (hasGravity) {
                    targetPosition.current.y = floorY;
                }

                const currentPosition = position.current;
                const target = targetPosition.current;

                const dx = target.x - currentPosition.x;
                const dy = target.y - currentPosition.y;

                const distance = Math.hypot(dx, dy);

                if (distance > 0) {
                    const movement = moveSpeed * deltaTime;
                    const weightReduction = weight * deltaTime;
                    let newPosition: Position = {x:0, y: 0}
                    if (distance <= movement) {
                        newPosition = {
                            x: target.x,
                            y: target.y,
                        };
                    } else {
                        newPosition = {
                            x: currentPosition.x + (dx / distance) * movement,
                            y: dy < 0 ? 
                            currentPosition.y + (dy / distance) * (movement - weightReduction) : // Move slower upwards
                            currentPosition.y + (dy / distance) * (2 * movement + weightReduction), // Move quicker downwards
                        };
                    }

                    position.current = newPosition;

                    updatePosition(position.current);
                }
            }
            if (position.current.y > floorY) {
                position.current.y = floorY;
                updatePosition(position.current);
            }

            animationFrame = requestAnimationFrame(moveObject);
        }

        animationFrame = requestAnimationFrame(moveObject);

        return () => {
            cancelAnimationFrame(animationFrame);
        };
    }, [moveSpeed, weight, physicsPaused, floorY, updatePosition]);


    return (
        <div 
            className="w-full h-full" 
        >
            {children}
        </div>
    );
};

export { PhysicsObject };
export default PhysicsObject;