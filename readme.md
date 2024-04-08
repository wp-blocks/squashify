# Squashify 
[![](https://img.shields.io/npm/v/squashify.svg?label=npm%20version)](https://www.npmjs.com/package/squashify)
[![](https://img.shields.io/npm/l/squashify)](https://github.com/wp-blocks/squashify?tab=GPL-3.0-1-ov-file#readme)
[![](https://github.com/wp-blocks/squashify/actions/workflows/node.js.yml/badge.svg)](https://github.com/wp-blocks/squashify/actions/workflows/node.js.yml)

## Features
- 🖼️ Efficient: Compresses and optimizes images using various algorithms to reduce file size and make your website load faster.
- 🔄 Supports multiple image formats: Can handle JPG, PNG, GIF, SVG, TIFF, AVIF, and WEBP files.
- 🌍 Better for the web: Generates compressed images that are optimized for the web, helping to reduce data usage and improve website performance and seo.
- ⚡️ Lightning-fast: Uses optimized algorithms and parallel processing to compress and optimize images as quickly as possible.
- 🛡️ Bulletproof: Written in strict TypeScript
- 💻 CLI and configuration file options: Supports command-line arguments and an ini file for easy and efficient use, and prompts you for input if no configuration is found.

## What is this?
A Node.js command-line tool and script to compress and optimize images, using different algorithms to reduce file size.

## Why Use This?
If you have a large number of images in a folder that need to be compressed and optimized, this package can be a lifesaver. With just one command, you can reduce the size of your images, making them load faster on your website. Whether you need to compress JPGs, optimize SVGs, or generate compressed AVIF or WebP images, this package has got you covered. It's a simple and effective way to make your website more efficient and your users happier. Give it a try and see the difference it can make!

## How Use This?
There are three ways to use squashify:

**As a Node.js script**: You can run the command using a Node.js script in your package.json file by specifying the input and output directories.

**As a dependency**: You can include the package as a dependency in your project, and use it in your code by specifying the input and output directories, and the compression options.

**As a command-line script**: You can use the script from the command line by running the npx command and following the prompts to enter the input and output directories, and select the compression options for each image format.

#### Requirements
- Node.js version 14 or above
- npm or yarn package manager

### as Node Script

To run the squashify command using a Node.js script in your package.json file, you can add the following code to your scripts section:

```json
{
  "scripts": {
    "squashify": "npx squashify --in ./old --out ./new"
  }
}
```

### as Dependency

To use squashify as a dependency in your project, simply include it in your package.json file:

```json
{
  "dependencies": {
    "squashify": "^1.0.0"
  }
}
```
Then, in your project code, you can import the package and use it as follows:

```js
const { compressImages } = require('squashify');

// Define source and destination directories
const sourceDir = 'path/to/source';
const destinationDir = 'path/to/destination';

// Define options for image compression
const options = {
	jpeg: { compressor: 'mozjpeg', quality: 85, progressive: true },
	png: { compressor: 'avif', quality: 80 },
	svg: { plugins: 'CleanupAttrs, RemoveDoctype' }
};

// Call the compressImages function with the defined parameters
compressImages(sourceDir, destinationDir, options);
```

This will compress all images in the source directory and save the compressed images to the destination directory, according to the specified compression options.

### Command line script 

To use the script, run the following command:

```bash
npx squashify --interactive
```

The script will prompt you to enter the source and destination directory paths. After entering the directories, the script will show the list of image formats available in the source directory. You can choose the compression options for each format.

## Configuration

### Command-Line Arguments
The following command-line arguments are available:

--in `<path>`: Specify the path to the input directory.

--out `<path>`: Specifies the path to the output directory.

--config `<path>`: Specifies the configuration file path.

--verbose: Verbose mode

--extMode: Specify whenever to replace or add image extensions. Options are 'replace' or 'add' (default: 'replace').

--generateIni: Generates an INI file in the project directory.

--size `<number>`: The maximum size of the compressed image in pixels.

--resizeMode: The mode to resize the image. Options are "contain", "cover", "fill", "inside", "outside", "none".

--interactive: prompts for required options that aren't provided 

--help: Shows the help message.

### INI File
The script also supports an INI file named `.squash` in the project directory. 

in order to generate the INI file, run the following command:

```bash
npx squashify --config .squash --defaultIni
```

The file should have the following sections and keys:

**\[path\]** This section contains the in and out keys, which specify the input and output directories, respectively.

**\[options\]** This section contains the options key, which specifies the compression options for all image formats. The available keys are extMode, maxSize, resizeMode, outMargin, background.

**\[\<format\>\]** This section specifies the compression options for a specific image format, where <format> is one of the supported formats listed above. The available keys are compressor and quality for most formats, and settings for SVGs.
Here's an example .squash file:

```ini
[path]
in = src/image
out = images

[options]
extMode = replace | add
overwrite = true | false
outMargin = 0
maxSize = 50
resizeType = contain | cover | fill | inside | outside | none
background = color | transparent | undefined

[.jpg,.jpeg]
compressor = mozjpeg
quality = 85
progressive = true


# the extension is allowed with and without the dot
[png]
compressor = avif
quality = 50

[.gif]
animation = true

[.svg]
plugins = cleanupAttrs, removeDoctype, removeXMLProcInst, removeComments, removeMetadata, removeXMLNS, removeEditorsNSData, removeTitle, removeDesc, removeUselessDefs, removeEmptyAttrs, removeHiddenElems, removeEmptyContainers, removeEmptyText, removeUnusedNS, convertShapeToPath, sortAttrs, mergePaths, sortDefsChildren, removeDimensions, removeStyleElement, removeScriptElement, inlineStyles, removeViewBox, removeElementsByAttr, cleanupIDs, convertColors, removeRasterImages, removeUselessStrokeAndFill, removeNonInheritableGroupAttrs,
```
### SVGO plugins

You can specify SVGO plugins in the `plugins` key of the `svg` section. 

This is the list of plugins supported by SVGO:
https://svgo.dev/docs/plugins/

### Supported Image Formats

The script supports the following image formats:

- WEBP (.webp)
- AVIF (.avif)
- HEIF (.heif)
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- SVG (.svg)
- TIFF (.tiff)

### Available Compression Options

- AVIF: `libvips`
- WEBP: `libwebp`
- JPEG: `libjpeg`
- MOZJPEG: `mozjpeg`
- PNG: `pngquant`
- SVG: `svgo`

---

### CLI command (video)

![convert](https://github.com/wp-blocks/squashify/assets/8550908/40f6c1a2-937c-4b05-ad04-cf07bb317d94)


## License

This script is licensed under the MIT License. See the [LICENSE](https://github.com/wp-blocks/squashify/blob/master/LICENSE) file for more information.
