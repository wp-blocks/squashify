import prompts from 'prompts';test
import {getImageCompressionOptions, srcDirQuestion} from "../../src/options";
import {logMessage} from "../../src/utils";

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

it('logs the message to the console when verbose is true', () => {
	// Redirect console.log to a mock function
	const consoleLogMock = jest.fn();
	console.log = consoleLogMock;

	// Call the logMessage function with verbose set to true
	logMessage('Hello, world!', true);

	// Expect console.log to have been called with the message argument
	expect(consoleLogMock).toHaveBeenCalledWith('Hello, world!');
});

it('does not log the message to the console when verbose is false', () => {
	// Redirect console.log to a mock function
	const consoleLogMock = jest.fn();
	console.log = consoleLogMock;

	// Call the logMessage function with verbose set to false
	logMessage('Hello, world!', false);

	// Expect console.log not to have been called
	expect(consoleLogMock).not.toHaveBeenCalled();
});

