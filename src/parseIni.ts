import fs from "fs";
import ini from "ini";
import { CompressionOption, type IniOptions, ScriptOptions } from "./types";
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
  iniOptions: CompressionOption,
): [InputFormats, CompressionOption] | undefined {
  // cleanup the option
  opt = processOption(opt);

  // flatten the compression options for the jpg format
  if (opt === "jpeg") {
    opt = "jpg";
  }
  return inputFormats.includes(opt)
    ? ([opt, iniOptions] as [InputFormats, CompressionOption])
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
): ScriptOptions | null {
  // Get the compression settings in the configuration file
  if (override) return override as IniOptions;
  // Get the compression settings in the configuration file
  if (fs.existsSync(path.join(process.cwd(), configFile))) {
    const iniOptions = ini.parse(
      fs.readFileSync(path.join(process.cwd(), configFile), "utf-8"),
    );

    // parse the settings for all formats in the inputFormats array
    const iniOptionsParsed: ScriptOptions = {
      srcDir: iniOptions.path.in ?? undefined,
      distDir: iniOptions.path.out ?? undefined,
      options: {
        extMode: iniOptions.options.extMode ?? undefined,
        resizeType: iniOptions.options.resizeType ?? undefined,
        overwrite: iniOptions.options.overwrite ?? undefined,
        maxSize: Number(iniOptions.options.maxSize) ?? undefined,
        outMargin: iniOptions.options.outMargin ?? undefined,
        background: iniOptions.options.background ?? undefined,
      },
      compressionOptions: {},
    };

    /**
     * Add an option to the iniOptionsParsed object
     * @param opt
     * @param dataset
     */
    function addOption(opt: string, dataset: CompressionOption) {
      const resp = processSingleOption(opt, dataset);
      if (resp) {
        const [format, options] = resp as [InputFormats, CompressionOption];
        iniOptionsParsed.compressionOptions[format] = options;
      }
    }

    /**
     * Adds the options in the iniOptions object to the iniOptionsParsed object
     *
     * @param opt - the option to process
     * @param iniOptions - the options in the ini file to be parsed for the compression options
     */
    function addRecursiveOptions(
      opt: string,
      iniOptions: Record<string, CompressionOption> | CompressionOption,
    ) {
      if (opt.endsWith(",")) {
        const opts = [];
        while (opt.endsWith(",")) {
          opts.push(opt.slice(0, -1));
          opt = Object.keys(iniOptions)[0];
          iniOptions = iniOptions[
            opt as keyof CompressionOption
          ] as CompressionOption;
        }
        const resp = processSingleOption(opt, iniOptions as CompressionOption);
        if (typeof resp === "object") {
          const [format, options] = resp as [InputFormats, CompressionOption];
          opts.push(format);
          opts.forEach((o) => addOption(o, options));
        }
      } else if (opt === "") {
        for (const o in iniOptions[opt as keyof CompressionOption] as Record<
          string,
          CompressionOption
        >) {
          addRecursiveOptions(
            o,
            iniOptions[opt as keyof CompressionOption] as Record<
              string,
              CompressionOption
            >,
          );
        }
      } else {
        addOption(
          opt,
          iniOptions[opt as keyof CompressionOption] as CompressionOption,
        );
      }
    }

    for (const opt in iniOptions) {
      addRecursiveOptions(opt, iniOptions);
    }

    // fill the missing formats with default values and clean up the options
    inputFormats
      // then parse the settings for each format
      .forEach((format) => {
        const currentIniOption = iniOptionsParsed.compressionOptions[
          format
        ] as Record<string, unknown>;

        // if the format was specified in the ini file
        if (iniOptionsParsed.compressionOptions?.hasOwnProperty(format)) {
          // Set the default compressor type
          iniOptionsParsed.compressionOptions[format].compressor =
            getDefaultCompressor(
              iniOptionsParsed.compressionOptions[format]?.compressor,
              format,
            ) as Compressor;

          iniOptionsParsed.compressionOptions[format].quality = getQuality(
            Number(iniOptionsParsed.compressionOptions[format].quality),
            format,
          ) as number;

          // if the format is .gif and the encodeAnimated option is set to true force the compressor to webp mode
          if (
            format === "gif" &&
            "encodeAnimated" in iniOptionsParsed.compressionOptions.gif
          ) {
            iniOptionsParsed.compressionOptions.gif.compressor = "webp";
          }

          // if the format is .svg and the plugins option is set, we can safely assume that the compressor is svgo
          if (
            format === "svg" &&
            "plugins" in iniOptionsParsed.compressionOptions.svg
          ) {
            // set the compressor to svgo and parse the plugins
            iniOptionsParsed.compressionOptions.svg.compressor = "svgo";
            iniOptionsParsed.compressionOptions.svg.plugins =
              getSvgoPluginOptions(
                (
                  iniOptionsParsed.compressionOptions.svg
                    .plugins as unknown as string
                )
                  .split(",")
                  .map((plugin: string) => plugin.trim())
                  .filter(Boolean),
              );
          }

          // if the format is .jpg and the progressive option is set
          if (format === "jpg") {
            iniOptionsParsed.compressionOptions.jpg.progressive =
              getJpgCompressionOptions(Boolean(currentIniOption?.progressive));
          }
        }
      });

    return iniOptionsParsed as ScriptOptions;
  }
  return null;
}
