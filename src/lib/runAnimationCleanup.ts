import { parseAnimationCleanupArgs, runAnimationCleanup } from "@/lib/animationCleanup";

async function main() {
  const selection = parseAnimationCleanupArgs(process.argv.slice(2));

  if (selection.mode === "all") {
    console.log("Starting animation cleanup for all folders.");
  } else if (selection.mode === "ids") {
    console.log(`Cleaning animation folders for IDs: ${selection.ids.join(", ")}`);
  } else {
    console.log(`Cleaning animation folders for range: ${selection.start} to ${selection.end}`);
  }

  const results = await runAnimationCleanup(selection);
  const totalMoved = results.reduce((total, entry) => total + entry.moved.length, 0);
  const missingIdle = results.filter((entry) => entry.missingIdle && !entry.lostCase).length;
  const lostCases = results.filter((entry) => entry.lostCase).length;

  console.log(`Processed ${results.length} sprite folders.`);
  console.log(`Moved ${totalMoved} animation files to the backup folder.`);

  if (missingIdle > 0) {
    console.log(`${missingIdle} folder(s) were skipped because they did not include an Idle animation and used a happy/walk fallback.`);
  }

  if (lostCases > 0) {
    console.log(`${lostCases} folder(s) were lost cases: neither Idle, Happy, nor Walk animations were available.`);
  }

  console.log("Animation cleanup complete.");
}

main().catch((error) => {
  console.error("Animation cleanup failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
