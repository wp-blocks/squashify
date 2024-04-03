import { type Compressor, type InputFormats } from "./constants";
import { PluginConfig as SvgoPluginConfig } from "svgo";
import { ParsedPath } from "path";
import { Path } from "glob";

export type ExtModes = "add" | "replace";

export type ResizeType =
	| "contain"
	| "cover"
	| "fill"
	| "inside"
	| "outside"
	| "none";

export type CompressionOptionsMap = {
	[key in InputFormats]?: CompressionOptions;
};

export type IniOptions = {
	[key: string]: string | unknown;
};

/* The `ScriptOptions` interface is defining the options that can be passed to a script. */
export interface ScriptOptions {
	srcDir: string;
	distDir: string;
	configFile?: string;
	verbose?: boolean;
	options: CompressionOption;
	interactive?: boolean;
	compressionOptions: CompressionOptionsMap;
}

export type CompressImagePaths = {
	file: Path;
	src: string;
	dist: string;
} & ParsedPath;

export interface CompressionOption {
	extMode: ExtModes;
	maxSize?: number | undefined;
	resizeType?: ResizeType;
}

/* These are types defining the options for compressing different types of files. */
export type CompressionOptions = {
	compress?: string;
	compressor?: Compressor;
	quality?: number;
	progressive?: boolean;
	plugins?: SvgoPluginConfig[];
	paths?: CompressImagePaths;
	options?: CompressionOption;
};
