import {
  CliOptions,
  ExtMode,
  IniOptions,
  ResizeType,
  ScriptOptions,
} from "./types";
import { logMessage } from "./utils";

export function parseOptions(
  settings: CliOptions,
  iniOptions: ScriptOptions | null = null,
): ScriptOptions {
  const newSettings: Partial<ScriptOptions> = {};

  // the source and destination directories
  newSettings.srcDir = settings.srcDir || String(iniOptions?.srcDir) || "";
  newSettings.distDir = settings.distDir || String(iniOptions?.distDir) || "";
  newSettings.verbose = settings.verbose || false;
  newSettings.interactive = settings.interactive || false;

  newSettings.options = iniOptions?.options || {};

  // if the user has specified an extMode, use it
  if (settings.extMode) {
    newSettings.options.extMode = settings.extMode;
  }

  // parse known settings about formats
  newSettings.compressionOptions = iniOptions
    ? iniOptions.compressionOptions
    : undefined;

  logMessage(
    `Configuration file loaded, options: ${JSON.stringify(settings)} ${newSettings.verbose}`,
  );
  return newSettings as ScriptOptions;
}
