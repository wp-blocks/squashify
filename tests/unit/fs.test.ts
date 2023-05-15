import fs from "fs";

import {getImageFormatsInFolder} from "../../src/utils";
import {srcDirQuestion} from "../../src/options";


describe('srcDirQuestion', () => {
	test('should return true if the path exists and is a directory', async () => {
		const value = './tests/images/test1';
		const result = await srcDirQuestion.validate(value);
		expect(result).toBe(true);
	});

	test('should return an error message if the path does not exist', async () => {
		const value = './tests/images/non-existent-path';
		const result = await srcDirQuestion.validate(value);
		expect(result).toBe('Path does not exist');
	});

	test('should return an error message if the path exists but is not a directory', async () => {
		const value = './tests/images/test1/image.png';
		const result = await srcDirQuestion.validate(value);
		expect(result).toBe('Path is not a directory');
	});

	test('should use the fs.promises.stat method to check if the path exists', async () => {
		const spy = jest.spyOn(fs.promises, 'stat');
		const value = './src/images';
		await srcDirQuestion.validate(value);
		expect(spy).toHaveBeenCalledWith(value);
		spy.mockRestore();
	});
});


describe('getImageFormatsInFolder', () => {

	beforeAll(() => {
		if (!fs.existsSync('tests/images/empty'))
			fs.mkdirSync('tests/images/empty');
	})

	it('should return an empty array when given an empty folder', () => {
		expect(getImageFormatsInFolder('tests/images/empty')).toEqual([]);
	});

	it('should return an array of image formats for a folder containing images', () => {
		expect(getImageFormatsInFolder('tests/images/test1')).toEqual(expect.arrayContaining(['.gif', '.jpg', '.png', '.svg', '.tiff']));
		expect(getImageFormatsInFolder('tests/images/test2')).toEqual(expect.arrayContaining(['.jpg', '.png']));
		expect(getImageFormatsInFolder('tests/images/test3')).toEqual(expect.arrayContaining(['.svg']));
	});

	it('should ignore files that are not images', () => {
		expect(getImageFormatsInFolder('tests/images/non-image')).toEqual([]);
	});
});
