import { defaultConfigFile, extModes } from "./constants.js";
import yargs, { Argv } from "yargs";
import { CliOptions, ExtMode, ResizeType, resizeType } from "./types.js";
import { hideBin } from "yargs/helpers";
import { generateDefaultConfigFile, logMessage } from "./utils.js";

/**
 * Get the command-line settings
 */
export function getCliOptions(rawArgs: Argv<object> | undefined): CliOptions {
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
    .option("defaultIni", {
      alias: "d",
      describe: "Generate default config file",
      type: "boolean",
    })
    .option("maxSize", {
      alias: "s",
      describe: "Maximum image size in pixels",
      type: "number",
      default: undefined,
    })
    .option("resizeType", {
      alias: "r",
      describe: "Resize type",
      type: "string",
      choices: resizeType,
      default: undefined,
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

  const configFileName = argv.config ?? defaultConfigFile;

  if (Boolean(argv.defaultIni) && configFileName) {
    generateDefaultConfigFile(configFileName, argv as Record<string, string>);

    logMessage(`Generated default config file: ${configFileName}`, true);

    process.exit(0);
  }

  const options: Record<string, string | boolean | number | undefined> = {
    extMode: (extMode as ExtMode) || "replace",
    maxSize: argv.maxSize ? Number(argv.maxSize) : undefined,
    resizeType: argv.resizeType ? (argv.resizeType as ResizeType) : undefined,
  };

  return {
    srcDir: argv.input ?? undefined,
    distDir: argv.output ?? undefined,
    configFile: configFileName,
    interactive: argv.interactive ?? false,
    verbose: Boolean(argv.verbose),
    options: JSON.parse(JSON.stringify(options)),
  };
}
