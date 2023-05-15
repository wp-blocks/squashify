import fs from "fs";
import path from "path";
import {optimizeSvg} from "../../src/utils";

describe('optimizeSvg', () => {
	const filePath = path.join(__dirname, '../images/test3/image.svg');

	const distPath = path.join(__dirname, '../images/image.min.svg');

	it('optimizes an SVG file and writes it to the specified output file', async () => {
		// Call the optimizeSvg function with test arguments
		await  optimizeSvg(filePath, distPath, {} )

		// Check if the optimized SVG was written to the correct location
		const writtenSvgContent = fs.readFileSync(distPath, 'utf8');

		// the file was written
		expect(writtenSvgContent).toBeDefined();

		// the file has content
		expect(writtenSvgContent.length).toBeGreaterThan(0);

		// Cleanup
		fs.unlinkSync(distPath);
	});
});
