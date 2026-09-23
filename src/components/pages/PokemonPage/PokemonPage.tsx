"use client";
import { PageTemplate } from "@/components/templates/PageTemplate/PageTemplate";
// ↑ Required because this file uses useState and event handlers.
// Server Components cannot hold state or respond to clicks; the browser can.

import { useState } from "react";
import { PlayArea } from "@/components/organisms/PlayArea/PlayArea";
import { type PokemonData } from "@/components/types/Pokemon";

/**
 * Props = data and functions this component receives from its parent.
 * The parent (`src/app/page.tsx`) loads todos on the server and passes
 * Server Actions here so this client component never talks to the database itself.
 */


type PokemonPageProps = {
  pokemon: PokemonData[];
};

const PokemonPage = function PokemonPage({ pokemon }: PokemonPageProps) {
  // useState: React re-renders this component whenever these values change.
  // The function form of the initial value runs once, so we don't remap the
  // array on every render.

  return (
    <PageTemplate>
      <div className="w-full h-full">
        <PlayArea pokemon={pokemon}/>
      </div>
    </PageTemplate>
  );
};

export { PokemonPage };
export default PokemonPage;
