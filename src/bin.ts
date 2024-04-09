#!/usr/bin/env node

// Run the script as an async function
import { humanFileSize, logMessage } from "./utils.js";
import { OutputData } from "./types.js";
import squashify from "./index.js";
import { getCliOptions } from "./parseArgs.js";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import process from "node:process";

// Get the cli settings
export default async function main() {
  const cliOptions = getCliOptions(yargs(hideBin(process.argv)));

  squashify(cliOptions)
    .then((response) => {
      const { timeElapsed, result, verbose } = response;

      if (result.length) {
        result.forEach((result) => {
          if (result.status !== "fulfilled") {
            logMessage("🔴 " + result.reason, true);
          } else {
            const { status, value } =
              result as PromiseFulfilledResult<OutputData>;
            logMessage(
              "✅ " +
                JSON.stringify(
                  "size" in value
                    ? { ...value, size: humanFileSize(value.size) }
                    : value,
                ),
              verbose,
            );
          }
          return;
        });
      }

      // Print the time elapsed in seconds to the console
      logMessage(`The end 🎉 - Time elapsed: ${timeElapsed} seconds`, true);
    })
    .catch((err) => {
      console.error(err);
    });
}

await main();
