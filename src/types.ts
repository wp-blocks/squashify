import { type Compressor, type InputFormats } from "./constants";
import { Config as SvgoConfig } from "svgo";
import { ParsedPath } from "path";
import { OutputInfo } from "sharp";

export const extModes = ["add", "replace"];

export type ExtMode = (typeof extModes)[number];

export const resizeType = [
  "contain",
  "cover",
  "fill",
  "inside",
  "outside",
  "none",
];

export type ResizeType = (typeof resizeType)[number];

export type CompressionOptionsMap = {
  [key in InputFormats]: CompressionOptions;
};

export interface GenericCompressionOptions {
  Compressor?: Compressor;
}

export interface SVGCompressionOption extends SvgoConfig {}

export interface JpegCompressionOption extends GenericCompressionOptions {
  quality?: number;
  progressive?: boolean;
}

export type CompressionOption =
  | JpegCompressionOption
  | SVGCompressionOption
  | GenericCompressionOptions;

/**
 * The `SquashOptions` interface is defining the settings that can be passed with the `.squash` .ini file that defines the general Squashify script settings.
 */
export type SquashOptions = {
  extMode?: ExtMode;
  resizeType?: ResizeType;
  overwrite?: boolean;
  maxSize?: number;
  outMargin?: number;
  background?: string;
};

export interface CliOptions {
  srcDir: string;
  distDir: string;
  verbose?: boolean;
  configFile?: string;
  extMode?: ExtMode;
  interactive?: boolean;
  options?: SquashOptions;
}

/**
 * The `ScriptOptions` interface is defining the settings that can be passed to a script.
 */
export interface ScriptOptions extends CliOptions {
  configFile?: string;
  verbose?: boolean;
  interactive?: boolean;
  options?: SquashOptions;
  compressionOptions: CompressionOptionsMap;
}

export interface IniOptions extends ScriptOptions {
  in: string;
  out: string;
}

export type CompressImagePaths = {
  srcDir: string;
  distDir: string;
  relativePath: string;
  filePath: string;
  srcPath: string;
  distPath: string;
  cwd: string;
} & ParsedPath;

/* These are types defining the settings for compressing different types of files. */
export type CompressionOptions = {
  compressor?: Compressor;
  quality?: number;
  progressive?: boolean;
};

export interface CompressionMeta extends CompressionOptions {
  paths: CompressImagePaths;
  options?: SquashOptions;
  background?: string;
  outMargin?: number;
}

export type OutputData =
  | OutputInfo
  | {
      originalSize: number;
      size: number;
    }
  | {
      copy: boolean;
    };
