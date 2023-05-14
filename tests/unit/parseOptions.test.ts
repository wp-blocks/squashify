import prompts from "prompts";
import {getPromptOptions} from "../../src/promps";

jest.mock('prompts', () => jest.fn());

describe('getPromptOptions', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('should prompt for source directory when not provided', async () => {
		const options = { distDir: './dist' };

		// Mock the prompts function to return the user's input
		(prompts as jest.MockedFunction<typeof prompts>)
			.mockResolvedValueOnce({ srcDir: './src' });

		const result = await getPromptOptions(options);

		expect(result.srcDir).toBe('./src');
		expect(prompts).toBeCalledTimes(1);
	});

	it('should prompt for destination directory when not provided', async () => {
		const options = { srcDir: './src' };

		// Mock the prompts function to return the user's input
		(prompts as jest.MockedFunction<typeof prompts>)
			.mockResolvedValueOnce({ distDir: './dist' });

		const result = await getPromptOptions(options);

		expect(result.distDir).toBe('./dist');
		expect(prompts).toBeCalledTimes(1);
	});

	it('should not prompt for compression options when already provided', async () => {
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
