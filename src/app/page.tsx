/*
 * Next.js App Router route for `/`.
 * Loads todos and injects Server Actions into the page component.
 * 
 * This is the root page of the application.
 */

// server side, DB code and actions
import { listPokemon } from "@/actions/pokemon/listPokemon/listPokemon";

// the main client component
import { PokemonPage } from "@/components/pages/PokemonPage/PokemonPage";

// Render this route on every request so listTodos() always returns current DB rows.
export const dynamic = "force-dynamic";

export default async function Home() {
  const pokemon = await listPokemon();
  // main client component with server side actions passed as props
  return (
    <PokemonPage
      pokemon={pokemon}
      getPokemon={listPokemon}
    />
  );
}
