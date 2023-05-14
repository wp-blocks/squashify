import prompts from 'prompts';
import {getImageCompressionOptions} from "../../src/options";

jest.mock('prompts');

describe('getImageCompressionOptions', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('prompts the user for compression options for each format', async () => {
		// Mock the user's responses
		(prompts.prompt as jest.Mock).mockResolvedValueOnce({ compress: 'yes', compressor: 'png', quality: 80 });
		(prompts.prompt as jest.Mock).mockResolvedValueOnce({ compress: 'yes', compressor: 'jpg', quality: 75 });
		(prompts.prompt as jest.Mock).mockResolvedValueOnce({ compress: 'no' });

		const options = await getImageCompressionOptions(['.png', '.jpg', '.webp']);

		expect(options).toEqual({
			'.png': { compress: "yes", compressor: 'png', quality: 80 },
			'.jpg': { compress: "yes", compressor: 'jpg', quality: 75 }
		});
	});

	it('prompts the user for SVG compression options', async () => {
		// Mock the user's responses
		(prompts.prompt as jest.Mock).mockResolvedValueOnce({ compress: 'yes', plugins: ['removeTitle'] });
		(prompts.prompt as jest.Mock).mockResolvedValueOnce({ compress: 'yes' });

		const options = await getImageCompressionOptions(['.svg']);

		expect(options).toEqual({
			'.svg': { compress: "yes", plugins: ['removeTitle'] },
		});
	});
});
