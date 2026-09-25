import { parseImportArgs, importSelectedPokemon } from "@/lib/pokemonImporter";

async function main() {
  const selection = parseImportArgs(process.argv.slice(2));

  if (selection.mode === "all") {
    console.log("Starting full Pokémon import.");
  } else if (selection.mode === "ids") {
    console.log(`Importing Pokémon IDs: ${selection.ids.join(", ")}`);
  } else {
    console.log(`Importing Pokémon range: ${selection.start} to ${selection.end}`);
  }

  await importSelectedPokemon(selection);
  console.log("Import completed.");
}

main().catch((error) => {
  console.error("Pokemon import failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
