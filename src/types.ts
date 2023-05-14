import { Config as SvgoConfig } from 'svgo';

import { Compressor, InputFormats } from './constants';

export interface CompressionOptions {
	compress: string;
	compressor?: Compressor;
	quality?: number;
	progressive?: boolean;
	plugins?: SvgoConfig[];
}

export interface ScriptOptions {
	srcDir: string;
	distDir: string;
	configFile: string;
	verbose: boolean;
	interactive: boolean;
	compressionOptions?: { [ key in InputFormats ]: CompressionOptions };
}
