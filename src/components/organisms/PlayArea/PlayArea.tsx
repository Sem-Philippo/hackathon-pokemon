"use client";

import Pokemon from "@/components/molecules/Pokemon/Pokemon";
import "@/components/organisms/PlayArea/PlayArea.css";
import { useEffect, useRef, useState } from "react";

const PlayArea = function PlayArea() {
    const [width, setWidth] = useState(100);
    const [height, setHeight] = useState(100);

    useEffect(() => {
        const resizeObserver = new ResizeObserver((event) => {
            setWidth(event[0].contentBoxSize[0].inlineSize);
            setHeight(event[0].contentBoxSize[0].blockSize);
            console.log("PlayArea resized:", event[0].contentBoxSize[0].inlineSize, event[0].contentBoxSize[0].blockSize);
        });

        resizeObserver.observe(document.getElementById("playArea") as Element);
    }, []);

  return (
    <div id="playArea"className="w-full h-full bg-amber-50 playArea">
        <Pokemon maxX={width} maxY={height} floorY={height - 50}/>
    </div>
  );
};

export { PlayArea };
export default PlayArea;
