#!/usr/bin/env node
import yargs from 'yargs'

import { getCliOptions } from './args'
import { convertImages } from './compression'
import { getIniOptions } from './ini'
import { getPromptOptions } from './promps'

/**
 * Prompts the user for the source and destination directories
 * then runs a function that converts the images.
 *
 * @returns Promise that resolves when the image conversion is complete
 */
export default async function main (): Promise<unknown> {
  // Get the cli options
  let options = getCliOptions(yargs(process.argv.slice(2)))

  // Get the options from the ini file
  options = getIniOptions(options)

  // Prompt the user for the script options
  if (options.interactive === true) {
    options = await getPromptOptions(options)
  }

  // Start the timer
  const startTime = Date.now()

  // Then convert the images in the source directory
  const res = await convertImages(options)

  if (res) {
    // Print the time elapsed in seconds to the console
    console.log( `The end 🎉 - Time elapsed: ${(Date.now() - startTime) / 1000} seconds` )

    return res
  }
}

main().catch((err) => {
  console.error(err)
})
