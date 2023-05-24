import fs from 'fs'

import ini from 'ini'

import {Compressor, inputFormats} from './constants'
import {type CompressionOptionsMap, type IniOptions, type ScriptOptions} from './types'
import {getCompressor, getJpgCompressionOptions, getQuality, getSvgoPluginOptions, logMessage} from './utils'
import {PluginConfig as SvgoPluginConfig} from "svgo";

/**
 * This function reads and parses a configuration file to get compression options and updates the
 * script options accordingly.
 *
 * @param {ScriptOptions} options - The `options` parameter is an object that contains various options
 * for a script. It is of type `ScriptOptions`.
 * @returns the updated `options` object with values from the configuration file, or the original
 * `options` object if no configuration file is found or if there is an error parsing the configuration
 * file.
 */
export function getIniOptions (options: ScriptOptions): ScriptOptions {
  let iniOptions: IniOptions;

  if (!options.configFile) {
    console.log(
			`🎃 Squashify: No ${options.configFile} file found. Please read the https://github.com/wp-blocks/squashify to know more about!`
    )
    return options
  }

  try {
    // Get the compression options in the configuration file
    iniOptions = ini.parse(
      fs.readFileSync(`./${options.configFile}`, 'utf-8')
    )
  } catch (err) {
    console.log(
			`🎃 Squashify: Cannot find a valid configuration or ${options.configFile} file does not exist.`
    )
    return options
  }

  if (Object.keys(iniOptions).length > 0) {
    options.srcDir = options.srcDir || (iniOptions.path as { in?: string })?.in || ''
    options.distDir = options.distDir || (iniOptions.path as { out?: string })?.out || ''

		options.compressionOptions = options.compressionOptions ?? {}

    // parse known options
    inputFormats
    // then parse the options for each format
      .forEach((format) => {
        const currentIniOption = iniOptions[format] as { compressor?: Compressor; quality?: string; progressive?: boolean; plugins?: string };

        (options.compressionOptions as CompressionOptionsMap)[format] = {
          compressor: getCompressor(currentIniOption?.compressor, format),
					quality: getQuality(Number(currentIniOption?.quality), format),
          progressive: getJpgCompressionOptions(currentIniOption?.progressive, format),
          plugins: getSvgoPluginOptions(currentIniOption?.plugins, format ) as SvgoPluginConfig[] | undefined,
        }
      })
  }

  logMessage(`Configuration file loaded, options: ${JSON.stringify(options)} ${options.verbose}`)
  return options
}
