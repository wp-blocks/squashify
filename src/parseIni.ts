import fs from "fs";
import ini from "ini";
import { CompressionOptions, type IniOptions } from "./types";
import path from "path";
import { Compressor, inputFormats } from "./constants";
import {
  getDefaultCompressor,
  getJpgCompressionOptions,
  getQuality,
  getSvgoPluginOptions,
} from "./utils";

function processOption(opt: string): string {
  if (opt.startsWith(".")) {
    opt = opt.slice(1);
  }
  if (opt.endsWith(",")) {
    opt = opt.slice(0, -1);
  }
  opt = opt.trim();
  return opt;
}

function processSingleOption(opt: string, iniOptions: CompressionOptions) {
  if (opt.startsWith(".")) {
    opt = processOption(opt);
  }
  return inputFormats.includes(opt) ? [opt, iniOptions] : undefined;
}

/**
 * This function reads and parses a configuration file to get compression settings and updates the
 * script settings accordingly.
 *
 * for a script. It is of type `ScriptOptions`.
 * @returns the updated `settings` object with values from the configuration file, or the original
 * `settings` object if no configuration file is found or if there is an error parsing the configuration
 * file.
 * @param configFile - The path to the configuration file.
 * @param override - The override options.
 */
export function getIniOptions(
  configFile: string | undefined = ".squash",
  override?: IniOptions,
): IniOptions | null {
  // Get the compression settings in the configuration file
  if (override) return override as IniOptions;
  // Get the compression settings in the configuration file
  if (fs.existsSync(path.join(process.cwd(), configFile))) {
    const iniOptions = ini.parse(
      fs.readFileSync(path.join(process.cwd(), configFile), "utf-8"),
    );

    // parse the settings for all formats in the inputFormats array
    const iniOptionsParsed: Record<string, CompressionOptions> = {};

    // the args with the comma for example ["jpg,webp"]
    for (const opt in iniOptions) {
      if (opt === "") {
        for (const innerOpt in iniOptions[opt]) {
          const res = processSingleOption(innerOpt, iniOptions[opt][innerOpt]);
          if (res) {
            const [o, v] = res;
            iniOptionsParsed[o] = v;
          }
        }
      } else {
        const res = processSingleOption(opt, iniOptions[opt]);
        if (res) {
          const [o, v] = res;
          iniOptionsParsed[o] = v;
        }
      }
    }

    iniOptions.compressionOptions = iniOptionsParsed;

    // parse the settings for all formats in the inputFormats array
    inputFormats
      // then parse the settings for each format
      .forEach((format) => {
        const currentIniOption = iniOptions[format] as Record<string, string>;

        // flatten the compression options for the jpg format
        if (format == "jpeg") {
          format = "jpg";
        }

        iniOptions[format] = {
          compressor: getDefaultCompressor(
            currentIniOption?.compressor,
            format,
          ) as Compressor,
          quality: getQuality(
            Number(currentIniOption?.quality),
            format,
          ) as number,
        };

        if (format === "svg" && iniOptions.svg.plugins) {
          iniOptions["svg"].plugins = getSvgoPluginOptions(
            currentIniOption?.plugins.split(",").map((plugin) => plugin.trim()),
          );
        }

        if (format === "jpg") {
          iniOptions["jpg"].progressive = getJpgCompressionOptions(
            Boolean(currentIniOption?.progressive),
          );
        }
      });

    return iniOptions as IniOptions;
  }
  return null;
}
