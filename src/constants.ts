import { Choice } from 'prompts';

export const defaultSrc = './src/images';
export const defaultDist = './images';
export const defaultConfigFile = './.image';

export const compressors = [ 'avif', 'webp', 'mozjpeg', 'jpg', 'png' ] as const;

export type Compressor = typeof compressors[ number ];

export const inputFormats = [
	'.jpg',
	'.jpeg',
	'.png',
	'.webp',
	'.avif',
	'.tiff',
	'.gif',
	'.svg',
] as const;

export type InputFormats = typeof inputFormats[ number ];

export const svgOptions: Choice[] = [
	{ title: 'CleanupAttrs', value: 'cleanupAttrs' },
	{ title: 'RemoveDoctype', value: 'removeDoctype' },
	{ title: 'RemoveXMLProcInst', value: 'removeXMLProcInst' },
	{ title: 'RemoveComments', value: 'removeComments' },
	{ title: 'RemoveMetadata', value: 'removeMetadata' },
	{ title: 'RemoveXMLNS', value: 'removeXMLNS' },
	{ title: 'RemoveEditorsNSData', value: 'removeEditorsNSData' },
	{ title: 'RemoveTitle', value: 'removeTitle' },
	{ title: 'RemoveDesc', value: 'removeDesc' },
	{ title: 'RemoveUselessDefs', value: 'removeUselessDefs' },
	{ title: 'RemoveEmptyAttrs', value: 'removeEmptyAttrs' },
	{ title: 'RemoveHiddenElems', value: 'removeHiddenElems' },
	{ title: 'RemoveEmptyContainers', value: 'removeEmptyContainers' },
	{ title: 'RemoveEmptyText', value: 'removeEmptyText' },
	{ title: 'RemoveUnusedNS', value: 'removeUnusedNS' },
	{ title: 'ConvertShapeToPath', value: 'convertShapeToPath' },
	{ title: 'SortAttrs', value: 'sortAttrs' },
	{ title: 'MergePaths', value: 'mergePaths' },
	{ title: 'SortDefsChildren', value: 'sortDefsChildren' },
	{ title: 'RemoveDimensions', value: 'removeDimensions' },
	{ title: 'RemoveStyleElement', value: 'removeStyleElement' },
	{ title: 'RemoveScriptElement', value: 'removeScriptElement' },
	{ title: 'InlineStyles', value: 'inlineStyles' },
	{ title: 'removeViewBox', value: 'removeViewBox' },
	{ title: 'removeElementsByAttr', value: 'removeElementsByAttr' },
	{ title: 'cleanupIDs', value: 'cleanupIDs' },
	{ title: 'convertColors', value: 'convertColors' },
	{ title: 'removeRasterImages', value: 'removeRasterImages' },
	{
		title: 'removeUselessStrokeAndFill',
		value: 'removeUselessStrokeAndFill',
	},
	{
		title: 'removeNonInheritableGroupAttrs',
		value: 'removeNonInheritableGroupAttrs',
	},
];
