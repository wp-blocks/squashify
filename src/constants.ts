import { type Choice } from "prompts";
import { PluginConfig } from "svgo";

export const defaultSrc = "src/images";
export const defaultDist = "images";
export const defaultConfigFile = ".squash";

export const compressors = [
	"avif",
	"webp",
	"mozjpeg",
	"jpg",
	"png",
	"svgo",
] as const;

export type Compressor = (typeof compressors)[number] | undefined;

export const inputFormats = [
	".jpg",
	".jpeg",
	".png",
	".webp",
	".avif",
	".heif",
	".tiff",
	".gif",
	".svg",
];

export type InputFormats = (typeof inputFormats)[number];

export const svgOptions: Choice[] = [
	{ title: "CleanupAttrs", value: "cleanupAttrs" },
	{ title: "RemoveDoctype", value: "removeDoctype" },
	{ title: "RemoveXMLProcInst", value: "removeXMLProcInst" },
	{ title: "RemoveComments", value: "removeComments" },
	{ title: "RemoveMetadata", value: "removeMetadata" },
	{ title: "RemoveXMLNS", value: "removeXMLNS" },
	{ title: "RemoveEditorsNSData", value: "removeEditorsNSData" },
	{ title: "RemoveTitle", value: "removeTitle" },
	{ title: "RemoveDesc", value: "removeDesc" },
	{ title: "RemoveUselessDefs", value: "removeUselessDefs" },
	{ title: "RemoveEmptyAttrs", value: "removeEmptyAttrs" },
	{ title: "RemoveHiddenElems", value: "removeHiddenElems" },
	{ title: "RemoveEmptyContainers", value: "removeEmptyContainers" },
	{ title: "RemoveEmptyText", value: "removeEmptyText" },
	{ title: "RemoveUnusedNS", value: "removeUnusedNS" },
	{ title: "ConvertShapeToPath", value: "convertShapeToPath" },
	{ title: "SortAttrs", value: "sortAttrs" },
	{ title: "MergePaths", value: "mergePaths" },
	{ title: "SortDefsChildren", value: "sortDefsChildren" },
	{ title: "RemoveDimensions", value: "removeDimensions" },
	{ title: "RemoveStyleElement", value: "removeStyleElement" },
	{ title: "RemoveScriptElement", value: "removeScriptElement" },
	{ title: "InlineStyles", value: "inlineStyles" },
	{ title: "removeViewBox", value: "removeViewBox" },
	{ title: "removeElementsByAttr", value: "removeElementsByAttr" },
	{ title: "cleanupIDs", value: "cleanupIds" },
	{ title: "convertColors", value: "convertColors" },
	{ title: "removeRasterImages", value: "removeRasterImages" },
	{
		title: "removeUselessStrokeAndFill",
		value: "removeUselessStrokeAndFill",
	},
	{
		title: "removeNonInheritableGroupAttrs",
		value: "removeNonInheritableGroupAttrs",
	},
];

export const defaultSvgoPlugins: PluginConfig[] = ["preset-default"];
export const extModes = ["replace", "add"];

export const transparentColor = {
	r: 0,
	g: 0,
	b: 0,
	alpha: 0,
};
