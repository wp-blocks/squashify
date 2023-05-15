import prompts from "prompts";
import {getPromptOptions} from "../../src/promps";
import {getOutputExtension} from "../../src/compression";
import {getCompressionOptions} from "../../src/utils";

jest.mock('prompts', () => jest.fn());

describe('getPromptOptions', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('Should prompt for source directory when not provided', async () => {
		const options = { distDir: './dist' };

		// Mock the prompts function to return the user's input
		(prompts as jest.MockedFunction<typeof prompts>)
			.mockResolvedValueOnce({ srcDir: './src' });

		const result = await getPromptOptions(options);

		expect(result.srcDir).toBe('./src');
		expect(prompts).toBeCalledTimes(1);
	});

	it('Should prompt for destination directory when not provided', async () => {
		const options = { srcDir: './src' };

		// Mock the prompts function to return the user's input
		(prompts as jest.MockedFunction<typeof prompts>)
			.mockResolvedValueOnce({ distDir: './dist' });

		const result = await getPromptOptions(options);

		expect(result.distDir).toBe('./dist');
		expect(prompts).toBeCalledTimes(1);
	});

	it('Should not prompt for compression options when already provided', async () => {
		const options = {
			srcDir: './src',
			distDir: './dist',
			compressionOptions: {
				jpeg: { quality: 75 },
				png: {},
			},
		};

		const result = await getPromptOptions(options);

		expect(result.compressionOptions).toEqual(options.compressionOptions);
		expect(prompts).toBeCalledTimes(0);
	});
});

describe('Should output file extension for a given image format', () => {
	it('Should return a new extension when compressor is "jpg" or "mozjpeg"', () => {
		expect(getOutputExtension('jpg', '.png')).toBe('.jpg');
		expect(getOutputExtension('mozjpeg', '.webp')).toBe('.jpg');
	});

	it('Should return an empty string when the new extension is the same as the original extension', () => {
		expect(getOutputExtension('mozjpeg', '.jpg')).toBe('');
		expect(getOutputExtension('png', '.png')).toBe('');
		expect(getOutputExtension('webp', '.webp')).toBe('');
	});

	it('Should return a new extension when the new extension is different from the original extension', () => {
		expect(getOutputExtension('jpg', '.png')).toBe('.jpg');
		expect(getOutputExtension('png', '.jpg')).toBe('.png');
		expect(getOutputExtension('webp', '.png')).not.toBe('.jpg');
	});
});

describe('getCompressionOptions', () => {
	it('Should return false for an unsupported image format', () => {
		const options = {
			jpeg: { quality: 80, progressive: true },
			png: { },
		};
		expect(getCompressionOptions('webp', options)).toBe(false);
	});

	it('Should return the compression options for a supported image format', () => {
		const options = {
			jpeg: { quality: 80, progressive: true },
			png: { },
		};
		expect(getCompressionOptions('jpeg', options)).toEqual({
			quality: 80,
			progressive: true,
		});
	});

	it('Should return false when no options are found for a supported image format', () => {
		const options = {
			jpeg: { quality: 80, progressive: true },
			png: { },
		};
		expect(getCompressionOptions('webp', options)).toBe(false);
	});
});
