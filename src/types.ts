import { type Compressor, type InputFormats } from './constants'
import {PluginConfig as SvgoPluginConfig} from "svgo";

/* These are types defining the options for compressing different types of files. */
export type CompressionOptions = {
	compress?: string
	compressor?: Compressor
	quality?: number
	progressive?: boolean
	plugins?: SvgoPluginConfig[]
}

export type CompressionOptionsMap = { [ key in InputFormats ]: CompressionOptions }

/* The `ScriptOptions` interface is defining the options that can be passed to a script. */
export interface ScriptOptions {
  srcDir: string
  distDir: string
  configFile?: string
  verbose?: boolean
  interactive?: boolean
  compressionOptions?: Partial<CompressionOptionsMap>
}

export type IniOptions = {
	[ key: string ]: string | unknown;
}
