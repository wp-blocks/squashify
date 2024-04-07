import fs from "fs";
import ini from "ini";
import { CompressionOptions, type IniOptions } from "./types";
import path from "path";
import { Compressor, InputFormats, inputFormats } from "./constants";
import {
  getDefaultCompressor,
  getJpgCompressionOptions,
  getQuality,
  getSvgoPluginOptions,
} from "./utils";

/**
 * Clean up an option in the ini file
 *
 * @param opt - the option to process
 * @returns the cleaned-up option
 */
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

/**
 * Process a single option in the ini file to return the input format and the compression options
 * @param opt - the option to process
 * @param iniOptions - the options in the ini file to be parsed for the compression options
 * @returns an array of the input format and the compression options
 */
function processSingleOption(
  opt: string,
  iniOptions: CompressionOptions,
): [InputFormats, CompressionOptions] | undefined {
  // cleanup the option
  opt = processOption(opt);

  // flatten the compression options for the jpg format
  if (opt === "jpeg") {
    opt = "jpg";
  }
  return inputFormats.includes(opt)
    ? ([opt, iniOptions] as [InputFormats, CompressionOptions])
    : undefined;
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

    function addOption(opt, ini) {
      const resp = processSingleOption(opt, ini[opt]);
      if (resp) {
        const [format, options] = resp as [InputFormats, CompressionOptions];
        iniOptionsParsed[format] = options;
      }
    }

    // the args with the comma for example ["jpg,webp"]
    for (const opt in iniOptions) {
      if (opt === "") {
        iniOptions[opt].forEach((o) => addOption(o, iniOptionsParsed));
      } else {
        addOption(opt, iniOptionsParsed);
      }
    }

    // parse the settings for all formats in the inputFormats array
    inputFormats
      // then parse the settings for each format
      .forEach((format) => {
        const currentIniOption = iniOptions[format] as Record<string, string>;

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
