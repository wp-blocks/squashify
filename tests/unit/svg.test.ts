import path from "path";
import fs from "fs";
import {optimizeSvg} from "../../src/compression";

describe('optimizeSvg', () => {
	const filePath = path.join(__dirname, '../images/test.svg');

	const distPath = path.join(__dirname, '../images/test.min.svg');

	it('optimizes an SVG file and writes it to the specified output file', () => {
		// Call the optimizeSvg function with test arguments
		optimizeSvg(filePath, distPath, {} );

		// Check if the optimized file was written to the correct location
		expect(fs.existsSync(distPath)).toBe(true);

		// Check if the optimized SVG was written to the correct location
		const expectedSvgContent = '<svg width=\"400\" height=\"110\"><path d=\"M0 0h300v100H0z\" style=\"fill:#00f;stroke-width:3;stroke:#000\"/>Sorry, your browser does not support inline SVG.</svg>';
		const writtenSvgContent = fs.readFileSync(distPath, 'utf8');
		expect(writtenSvgContent).toBe(expectedSvgContent);

	});
});
