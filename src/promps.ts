import prompts from 'prompts';

import {
	distDirQuestion,
	getImageCompressionOptions,
	srcDirQuestion,
} from './options';
import { ScriptOptions } from './types';
import { getImageFormatsInFolder } from './utils';

export async function getPromptOptions(
	options: ScriptOptions
): Promise< ScriptOptions > {
	// If the source directory is not specified, prompt the user
	if ( ! options.srcDir ) {
		const response = await prompts( srcDirQuestion );
		options.srcDir = response.srcDir;
	}

	// If the destination directory is not specified, prompt the user
	if ( ! options.distDir ) {
		const response = await prompts( distDirQuestion );
		options.distDir = response.distDir;
	}

	// If the compression options are not specified, prompt the user
	if ( options.compressionOptions ) {
		// Get the image formats
		const imageFormats = getImageFormatsInFolder( options.srcDir );

		// If no image formats are found, return
		if ( ! imageFormats.length ) {
			console.log( 'No image formats found in the source directory' );
			return options;
		}

		// Prompt the user for compression options
		options.compressionOptions = await getImageCompressionOptions(
			imageFormats
		);
	}

	return options;
}
