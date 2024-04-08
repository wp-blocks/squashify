import { defaultConfigFile, extModes } from "./constants";
import yargs from "yargs";
import { CliOptions, ExtMode } from "./types";
import { hideBin } from "yargs/helpers";

/**
 * Get the command-line settings
 */
export function getCliOptions(
  rawArgs: yargs.Argv<object> | undefined,
): CliOptions {
  if (!rawArgs) {
    rawArgs = yargs(hideBin(process.argv));
  }
  // Check for command-line arguments
  const argv = rawArgs
    .usage("Usage: $0 [settings]")
    .option("input", {
      describe: "Source directory",
      type: "string",
      alias: "in",
    })
    .option("output", {
      describe: "Destination directory",
      type: "string",
      alias: "out",
    })
    .option("config", {
      alias: "c",
      describe: "Configuration File",
      type: "string",
    })
    .option("interactive", {
      alias: "i",
      describe: "Interactive mode",
      type: "boolean",
    })
    .option("extMode", {
      alias: "e",
      describe: "Whenever to add or replace extension",
      type: "string",
      choices: ["add", "replace"],
      default: "replace",
      coerce: (value: string) =>
        (extModes.includes(value) && value in extModes) ||
        undefined ||
        "replace",
    })
    .option("verbose", {
      alias: "v",
      type: "boolean",
      description: "Run with verbose logging",
    })
    .help("h")
    .alias("h", "help")
    .parseSync();

  const extMode =
    typeof argv.extMode === "string" && argv?.extMode in extModes
      ? (argv.extMode as ExtMode)
      : "replace";

  return {
    srcDir: argv.input ?? "",
    distDir: argv.output ?? "",
    configFile: argv.config ?? defaultConfigFile,
    interactive: Boolean(argv.interactive),
    verbose: Boolean(argv.verbose),
    options: extMode
      ? {
          extMode: (extMode as ExtMode) || "replace",
        }
      : undefined,
  };
}
