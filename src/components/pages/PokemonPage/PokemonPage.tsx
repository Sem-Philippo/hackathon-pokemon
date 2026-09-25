"use client";
import { PageTemplate } from "@/components/templates/PageTemplate/PageTemplate";
// ↑ Required because this file uses useState and event handlers.
// Server Components cannot hold state or respond to clicks; the browser can.

import { useState } from "react";
import { PlayArea } from "@/components/organisms/PlayArea/PlayArea";
import { Shop, type ShopItem } from "@/components/organisms/Shop/Shop";
import { type QueuedItem, FoodItem, ItemType } from "@/components/types/Items";
import { type PokemonData } from "@/components/types/Pokemon";

/**
 * Props = data and functions this component receives from its parent.
 * The parent (`src/app/page.tsx`) loads todos on the server and passes
 * Server Actions here so this client component never talks to the database itself.
 */


type PokemonPageProps = {
  pokemon: PokemonData[];
  getPokemon: () => Promise<PokemonData[]>;
};

const showPokemonDebugInfo = false;

const PokemonPage = function PokemonPage({ pokemon: initialPokemon, getPokemon }: PokemonPageProps) {
  const [pokemon, setPokemon] = useState(initialPokemon);
  const [queuedItems, setQueuedItems] = useState<QueuedItem[]>([]);

  const shopItems: ShopItem[] = [
    FoodItem.Oran_Berry,
    FoodItem.Pecha_Berry,
    FoodItem.Cheri_Berry,
    FoodItem.Rawst_Berry,
    FoodItem.Chesto_Berry,
    FoodItem.Aspear_Berry,
    FoodItem.Sitrus_Berry,
    FoodItem.Lum_Berry,
  ].map((berry, index) => {
    const label = FoodItem[berry].replace(/_/g, " ");
    const iconFiles = [
      "oran_berry",
      "pecha_berry",
      "cheri_berry",
      "rawst_berry",
      "chesto_berry",
      "aspear_berry",
      "sitrus_berry",
      "lum_berry",
    ];

    return {
      id: `${berry}-${index}`,
      label,
      cost: 25 + index * 5,
      icon: `/media/items/${iconFiles[index]}.png`,
      item: {
        name: FoodItem[berry],
        type: ItemType.food,
        size: { width: 30, height: 30 },
      },
    };
  });

  shopItems.push({
    id: "egg",
    label: "Egg",
    cost: 100,
    icon: "/media/items/egg.png",
    item: {
      name: "Egg",
      type: ItemType.egg,
      size: { width: 40, height: 40 },
    },
  });

  async function buyItem(item: QueuedItem) {
    if (item.type === ItemType.egg) {
      const newPokemon = await getPokemon();
      const hatchedPokemon = newPokemon[0];

      if (hatchedPokemon) {
        setPokemon((previous) => [...previous, { ...hatchedPokemon, spawnPosition: "top" }]);
      }

      return;
    }

    setQueuedItems((previous) => [...previous, item]);
  }

  return (
    <PageTemplate showHeader={false} showFooter={false}>
      <div className="relative h-full w-full overflow-hidden bg-stone-100">
        <Shop
          items={shopItems}
          onBuy={buyItem}
        />
        <PlayArea queuedItems={queuedItems} setQueuedItems={setQueuedItems} pokemon={pokemon} showDebugInfo={showPokemonDebugInfo}/>
      </div>
    </PageTemplate>
  );
};

export { PokemonPage };
export default PokemonPage;
