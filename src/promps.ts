import prompts from 'prompts'

import {
  distDirQuestion,
  getImageCompressionOptions,
  srcDirQuestion
} from './options'
import { type ScriptOptions } from './types'
import { getImageFormatsInFolder, logMessage } from './utils'

export async function getPromptOptions (
  options: ScriptOptions
): Promise< ScriptOptions > {
  // If the source directory is not specified, prompt the user
  if (!options.srcDir) {
    const response = await prompts(srcDirQuestion)
    options.srcDir = response.srcDir
  }

  // If the destination directory is not specified, prompt the user
  if (!options.distDir) {
    const response = await prompts(distDirQuestion)
    options.distDir = response.distDir
  }

  // If the compression options are not specified, prompt the user

  // Get the image formats
  const imageFormats = getImageFormatsInFolder(options.srcDir)

  // If no image formats are found, return
  if (imageFormats.length === 0) {
    logMessage('No image formats found in the source directory', options.verbose)
    return options
  }

  // Prompt the user for compression options
  options.compressionOptions = await getImageCompressionOptions(
    imageFormats,
    options.verbose
  )

  return options
}
