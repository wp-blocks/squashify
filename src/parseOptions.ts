import { CliOptions, ScriptOptions } from "./types.js";
import { logMessage } from "./utils.js";

export function parseOptions(
  settings: CliOptions,
  iniOptions: ScriptOptions | undefined = undefined,
): ScriptOptions {
  const newSettings: Partial<ScriptOptions> = {};

  // the source and destination directories
  newSettings.srcDir = settings.srcDir || String(iniOptions?.srcDir) || "";
  newSettings.distDir = settings.distDir || String(iniOptions?.distDir) || "";
  newSettings.verbose = settings.verbose || false;
  newSettings.interactive = settings.interactive || false;

  newSettings.options = { ...iniOptions?.options, ...settings.options };

  // parse known settings about formats
  newSettings.compressionOptions = iniOptions
    ? iniOptions.compressionOptions
    : undefined;

  logMessage(
    `Configuration file loaded, options: ${JSON.stringify(settings)} ${newSettings.verbose}`,
  );
  return newSettings as ScriptOptions;
}
