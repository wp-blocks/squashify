/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';

import sharp, {OutputInfo} from 'sharp';
import { Config as SvgoConfig, optimize } from 'svgo';

import {Compressor, compressors} from './constants';
import {asInputFormats, getCompressionOptions, logMessage} from './utils';
import {JPGCompressionOptions, SVGCompressionOptions} from "./types";

/**
 * The function optimizes an SVG file using SVGO and writes the optimized SVG to a
 * specified output file.
 *
 * @param filePath    The path to the SVG file that needs to be optimized.
 * @param distPath    The `distPath` parameter is a string representing the file path
 *                    where the optimized SVG file will be written to.
 * @param svgoOptions `svgoOptions` is an object that contains options for optimizing
 *                    the SVG using SVGO (SVG Optimizer). These options can include things like removing
 *                    comments, removing empty groups, and optimizing path data. The specific options and
 *                    their values will depend on the desired optimization settings.
 */
export function optimizeSvg(
	filePath: string,
	distPath: string,
	svgoOptions: SvgoConfig
): Promise<void> {
	// Read the SVG file from the file system
	const svg = fs.readFileSync( filePath, 'utf8' );

	// Optimize the SVG with SVGO
	const optimizedSvg = optimize( svg, svgoOptions );

	// Write the optimized SVG to the output file
	return fs.promises.writeFile( distPath, optimizedSvg.data );
}

/**
 * Returns the output file extension for a given image format
 * is needed because the mozjpeg compressor needs to be saved with the jpg extension
 * and to avoid the jpeg extension being added to the output file when saving a jpeg file
 *
 * @param compressor  The image format
 * @param originalExt The original file extension
 * @returns The output file extension
 */
export function getOutputExtension( compressor: Compressor, originalExt ) {
	let newExt = '.'.concat( compressor );

	switch ( compressor ) {
		case 'jpg':
		case 'mozjpeg':
			newExt = '.jpg';
			break;
	}

	return originalExt !== newExt ? newExt : '';
}

/**
 * The function converts images in a source directory to a specified format and
 * compresses them, while also copying non-image files to a destination directory.
 *
 * @param options                    The options object
 * @param options.srcDir             The source directory from where the images will be read and
 *                               converted.
 * @param options.distDir            The destination directory where the converted images will be
 *                               saved. If no value is provided, the images will be saved in the same directory as
 *                               the source images.
 * @param options.compressionOptions An optional object that contains compression options
 *                               for different image formats. The default value is an empty object. The object should
 *                               have keys that correspond to image formats (e.g. "jpg", "png", "webp") and values
 *                               that are objects containing compression options for that format (e.g. "no", "mozjpeg", "jpeg").
 */
export async function convertImages( options ): Promise<any> {
	// destructuring the options
	const { srcDir, distDir, compressionOptions } = options;

	// check if the srcDir is a directory
	if ( ! fs.existsSync( srcDir ) ) {
		return new Promise(() => {console.warn( `${ srcDir } is not a directory` )});
	}

	// check if the srcDir is a directory
	if ( typeof compressionOptions === 'undefined') {
		return new Promise(() => {console.warn( `No compression options not provided... maybe you want to try the interactive mode?` )});
	}

	// Get a list of files in the source directory
	const files = fs.readdirSync( srcDir );

	// Loop through the files in the directory
	const promises = files.map( ( file: string ) => {
		// Get the full path of the file
		const filePath = path.join( srcDir, file );

		// Get the stats of the file
		const stats = fs.statSync( filePath );

		// Check if the file is a directory
		if ( stats.isDirectory() ) {
			// Recursively call this function on the subdirectory
			const subDir = path.join( distDir, file );
			fs.mkdirSync( subDir, { recursive: true } );

			logMessage( `Converted ${ file } to ${ subDir }`, options.verbose );

			// Call this function on the subdirectory
			return convertImages( {
				srcDir: filePath,
				distDir: subDir,
				compressionOptions,
			} );
		}

		// Save the image to the destination directory
		const distPath = path.join( distDir, file );

		// Get the extension of the file
		const extension = path.extname( filePath ).toLowerCase();


		// Set the default options for the image format
		const compressOpt = getCompressionOptions( extension, compressionOptions );


		// create the output directory if it doesn't exist
		if ( ! fs.existsSync( distDir ) ) {
			fs.mkdirSync( distDir );
		}

		// Check if the file is an image
		if ( asInputFormats( extension ) && compressOpt ) {
			// The output file name
			const distFileName = distPath.concat(
				getOutputExtension( compressOpt.compressor, extension )
			);

			// Apply compression options
			if ( extension === '.svg' && compressOpt?.compressor === 'svgo' ) {
				// Save the image to the destination directory
				return optimizeSvg( filePath, distPath, { ...(compressOpt as SVGCompressionOptions).plugins } as SvgoConfig );
			} else {
				// Load the image with sharp
				let image = sharp( filePath );

				// Apply compression options if specified in the options
				if ( compressOpt.compressor ) {
					switch ( compressOpt.compressor ) {
						case 'avif':
							image = image.avif( {
								quality: compressOpt.quality,
							} );
							break;
						case 'webp':
							image = image.webp( {
								quality: compressOpt.quality,
							} );
							break;
						case 'png':
							image = image.png();
							break;
						case 'mozjpeg':
							image = image.jpeg( {
								mozjpeg: true,
								quality: compressOpt.quality,
							} );
							break;
						case 'jpg':
							const jpegOpt =  compressOpt as JPGCompressionOptions;
							image = image.jpeg( {
								quality: jpegOpt.quality,
								progressive: jpegOpt.progressive,
							} );
							break;
					}
				}

				logMessage(
					`File converted from ${ filePath } to ${ distFileName }`,
					options.verbose
				);
				return image.toFile( distFileName );
			}
		} else {
			logMessage( `File copied from ${ filePath } to ${ distPath }`,
				options.verbose
			);

			// Write the contents to the destination file
			return fs.promises.copyFile( filePath, distPath );
		}
	} );

	// Wait for all promises to resolve before returning
	return Promise.all( promises )
}
