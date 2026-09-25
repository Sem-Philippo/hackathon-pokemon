import { parsePortraitCleanupArgs, runPortraitCleanup } from "@/lib/portraitCleanup";

async function main() {
  const selection = parsePortraitCleanupArgs(process.argv.slice(2));

  if (selection.mode === "all") {
    console.log("Starting portrait cleanup for all folders.");
  } else if (selection.mode === "ids") {
    console.log(`Cleaning portrait folders for IDs: ${selection.ids.join(", ")}`);
  } else {
    console.log(`Cleaning portrait folders for range: ${selection.start} to ${selection.end}`);
  }

  const results = await runPortraitCleanup(selection);
  const movedFiles = results.reduce((total, entry) => total + entry.moved.length, 0);
  const skipped = results.filter((entry) => entry.skipped).length;

  console.log(`Processed ${results.length} portrait folders.`);
  console.log(`Moved ${movedFiles} files to the backup folder.`);

  if (skipped > 0) {
    console.log(`${skipped} folder(s) were skipped because they do not exist.`);
  }

  console.log("Portrait cleanup complete.");
}

main().catch((error) => {
  console.error("Portrait cleanup failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
