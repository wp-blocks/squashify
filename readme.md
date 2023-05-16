# squashify 

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
If you have a large number of images in a folder that need to be compressed and optimized, this package can be a lifesaver. With just one command, you can easily reduce the size of your images, making them load faster on your website. Whether you need to compress JPGs, optimize SVGs, or generate compressed AVIF or WebP images, this package has got you covered. It's a simple and effective way to make your website more efficient and your users happier. Give it a try and see the difference it can make!

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

--in <path>: Specifies the path to the input directory.

--out <path>: Specifies the path to the output directory.

--config <path>: Specifies the configuration file path.

--verbose: Verbose mode

--interactive: prompts for required options that aren't provided 

--help: Shows the help message.

### INI File
The script also supports an INI file named .image in the project directory. The file should have the following sections and keys:

**path** This section contains the in and out keys, which specify the input and output directories, respectively.

**format[]** This section specifies the compression options for a specific image format, where <format> is one of the supported formats listed above. The available keys are compressor and quality for most formats, and options for SVGs.
Here's an example .image file:

```ini
[path]
in = ./src/images
out = ./images

[.jpg]
compressor = mozjpeg
quality = 85
progressive = true

[.png]
compressor = avif
quality = 50

[.svg]
options = CleanupAttrs, RemoveDoctype, RemoveXMLProcInst, RemoveComments, RemoveMetadata, RemoveXMLNS, RemoveEditorsNSData, RemoveTitle, RemoveDesc, RemoveUselessDefs, RemoveEmptyAttrs, RemoveHiddenElems, RemoveEmptyContainers, RemoveEmptyText, RemoveUnusedNS, ConvertShapeToPath, SortAttrs, MergePaths, SortDefsChildren, RemoveDimensions, RemoveStyleElement, RemoveScriptElement, InlineStyles, removeViewBox, removeElementsByAttr, cleanupIDs, convertColors, removeRasterImages, removeUselessStrokeAndFill, removeNonInheritableGroupAttrs,
```
### Supported Image Formats

The script supports the following image formats:

- AVIF (.avif)
- WEBP (.webp)
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

## License

This script is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more information.
