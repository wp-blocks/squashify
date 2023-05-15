import path from "path";
import fs from "fs";
import {optimizeSvg} from "../../src/compression";

describe('optimizeSvg', () => {
	const filePath = path.join(__dirname, '../images/test3/image.svg');

	const distPath = path.join(__dirname, '../images/dist/image.min.svg');

	it('optimizes an SVG file and writes it to the specified output file', () => {
		// Call the optimizeSvg function with test arguments
		optimizeSvg(filePath, distPath, {} );

		// Check if the optimized file was written to the correct location
		expect(fs.existsSync(distPath)).toBe(true);

		// Check if the optimized SVG was written to the correct location
		const writtenSvgContent = fs.readFileSync(distPath, 'utf8');
		expect(writtenSvgContent).toBeDefined();

		// Cleanup
		fs.unlinkSync(distPath);

	});
});
