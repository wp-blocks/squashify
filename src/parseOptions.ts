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
  iniOptions: IniOptions | null = null,
): ScriptOptions {
  const newSettings: Partial<ScriptOptions> = {};

  // the source and destination directories
  newSettings.srcDir = settings.srcDir || String(iniOptions?.in) || "";
  newSettings.distDir = settings.distDir || String(iniOptions?.out) || "";
  newSettings.verbose = settings.verbose || false;
  newSettings.interactive = settings.interactive || false;

  newSettings.options = iniOptions
    ? {
        // the ext format settings
        extMode: (iniOptions.options?.extMode as ExtMode) ?? "replace",
        // the resize settings
        resizeType: (iniOptions.options?.resizeType as ResizeType) ?? "none",
        // the maximum image size in pixels
        maxSize: Number(iniOptions.options?.maxSize) ?? undefined,
      }
    : undefined;

  // parse known settings about formats
  newSettings.compressionOptions = iniOptions
    ? { ...iniOptions.compressionOptions }
    : undefined;

  logMessage(
    `Configuration file loaded, options: ${JSON.stringify(settings)} ${newSettings.verbose}`,
  );
  return newSettings as ScriptOptions;
}
