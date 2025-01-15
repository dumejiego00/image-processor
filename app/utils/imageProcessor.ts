import { promises as fs, createReadStream, createWriteStream } from 'fs';
import path from 'path';
import { PNG } from 'pngjs';
import AdmZip from 'adm-zip'; 

export async function grayScaleImages(inputDir: string, outputDir: string) {
  const files = await fs.readdir(inputDir);
  const pngFiles = files.filter(file => path.extname(file).toLowerCase() === '.png');

  for (const file of pngFiles) {
    await grayScale(path.join(inputDir, file), path.join(outputDir, file));
  }

  const zip = new AdmZip();
  pngFiles.forEach(file => {
    zip.addLocalFile(path.join(outputDir, file));
  });

  zip.writeZip(path.join(outputDir, 'grayscale_images.zip'));
}

function grayScale(inputPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    createReadStream(inputPath)
      .pipe(new PNG())
      .on('parsed', function (this: PNG) {  
        for (let y = 0; y < this.height; y++) {
          for (let x = 0; x < this.width; x++) {
            const idx = (this.width * y + x) << 2;
            const avg = (this.data[idx] + this.data[idx + 1] + this.data[idx + 2]) / 3;

            this.data[idx] = avg;
            this.data[idx + 1] = avg;
            this.data[idx + 2] = avg;
          }
        }

        this.pack()
          .pipe(createWriteStream(outputPath))
          .on('finish', resolve)
          .on('error', reject);
      })
      .on('error', reject);
  });
}
