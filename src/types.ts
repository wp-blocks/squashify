import { Config as SvgoConfig } from 'svgo';

import { Compressor, InputFormats } from './constants';

export interface DefaultCompressionOptions {
	compress: string;
	compressor?: Compressor;
	quality?: number;
}

export interface JPGCompressionOptions extends DefaultCompressionOptions {
	progressive: boolean;
}

export interface SVGCompressionOptions extends DefaultCompressionOptions {
	plugins?: SvgoConfig[];
}

export type CompressionOptions = JPGCompressionOptions | DefaultCompressionOptions | SVGCompressionOptions ;

export interface ScriptOptions {
	srcDir: string;
	distDir: string;
	configFile: string;
	verbose: boolean;
	interactive: boolean;
	compressionOptions?: { [ key in InputFormats ]: CompressionOptions };
}
