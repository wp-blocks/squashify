import { defaultConfigFile } from './constants'
import type yargs from 'yargs'
import { type ScriptOptions } from './types'

/**
 * Get the command-line options
 *
 * @param rawArgs The raw command-line arguments parsed by yargs
 */
export function getCliOptions (rawArgs: yargs.Argv<object>): ScriptOptions {
  // Check for command-line arguments
  const argv = rawArgs
    .usage('Usage: $0 [options]')
    .option('in', {
      describe: 'Source directory',
      type: 'string'
    })
    .option('out', {
      describe: 'Destination directory',
      type: 'string'
    })
    .option('config', {
      alias: 'c',
      describe: 'Configuration File',
      type: 'string'
    })
    .option('interactive', {
      alias: 'i',
      describe: 'Interactive mode',
      type: 'boolean'
    })
    .option('verbose', {
      alias: 'v',
      type: 'boolean',
      description: 'Run with verbose logging'
    })
    .help('h')
    .alias('h', 'help')
    .parseSync()

  return {
    srcDir: argv.in ?? '',
    distDir: argv.out ?? '',
    configFile: argv.config ?? defaultConfigFile,
    interactive: argv.interactive ?? false,
    verbose: argv.verbose ?? false,
    compressionOptions: undefined
  }
}
