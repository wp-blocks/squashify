import {describe, expect, it} from "@jest/globals";
import {getImageFormatsInFolder} from "../../src/utils";

describe('getImageFormatsInFolder', () => {
	it('should return an empty array when given an empty folder', () => {
		expect(getImageFormatsInFolder('tests/images/empty')).toEqual([]);
	});

	it('should return an array of image formats for a folder containing images', () => {
		expect(getImageFormatsInFolder('tests/images/test1')).toEqual(expect.arrayContaining(['.gif', '.jpg', '.png', '.svg',  '.tiff']));
		expect(getImageFormatsInFolder('tests/images/test2')).toEqual(expect.arrayContaining(['.jpg', '.png']));
		expect(getImageFormatsInFolder('tests/images/test3')).toEqual(expect.arrayContaining(['.svg']));
	});

	it('should ignore files that are not images', () => {
		expect(getImageFormatsInFolder('tests/images/non-image')).toEqual([]);
	});
});
