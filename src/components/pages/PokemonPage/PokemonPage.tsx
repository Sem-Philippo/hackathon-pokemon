"use client";
import { PageTemplate } from "@/components/templates/PageTemplate/PageTemplate";
// ↑ Required because this file uses useState and event handlers.
// Server Components cannot hold state or respond to clicks; the browser can.

import { useState } from "react";
import { PlayArea } from "@/components/organisms/PlayArea/PlayArea";
import Button from "@/components/atoms/Button/Button";
import { type QueuedItem, FoodItem, ItemType } from "@/components/types/Items";
import { type PokemonData } from "@/components/types/Pokemon";

/**
 * Props = data and functions this component receives from its parent.
 * The parent (`src/app/page.tsx`) loads todos on the server and passes
 * Server Actions here so this client component never talks to the database itself.
 */


type PokemonPageProps = {
  pokemon: PokemonData[];
};

const showPokemonDebugInfo = false;

const PokemonPage = function PokemonPage({ pokemon }: PokemonPageProps) {
  const [queuedItems, setQueuedItems] = useState<QueuedItem[]>([]);

  const foodItems: QueuedItem[] = 
  [{
    name: FoodItem[FoodItem.Sitrus_Berry].toString(),
    type: ItemType.food,
    size: {width: 40, height: 40}
  },
  {
    name: FoodItem[FoodItem.Oran_Berry].toString(),
    type: ItemType.food,
    size: {width: 40, height: 40}
  }]
  // useState: React re-renders this component whenever these values change.
  // The function form of the initial value runs once, so we don't remap the
  // array on every render.

  return (
    <PageTemplate>
      <div className="w-full h-full">
        <PlayArea queuedItems={queuedItems} setQueuedItems={setQueuedItems} pokemon={pokemon} showDebugInfo={showPokemonDebugInfo}/>
        {foodItems.map((item, index) => <Button key={item.name} onClick={() => setQueuedItems((prev) => [...prev, foodItems[index]])}><p>{item.name.replace("_", " ")}</p></Button>)}
      </div>
    </PageTemplate>
  );
};

export { PokemonPage };
export default PokemonPage;
