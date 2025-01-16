import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { grayScaleImages } from '../../utils/imageProcessor';

export async function POST(req: Request) {
  try {
    const { imagesDirPath } = await req.json();

    if (!imagesDirPath) {
      return NextResponse.json({ error: 'No images directory path provided.' }, { status: 400 });
    }

    const baseDir = path.dirname(imagesDirPath);

    const processedDir = path.join(baseDir, 'processedImages');
    await fs.mkdir(processedDir, { recursive: true });

    await grayScaleImages(imagesDirPath, processedDir);

    const grayscaleImages = (await fs.readdir(processedDir))
    .filter(file => file.toLowerCase().endsWith('.png'))
    .map(file => `${processedDir.split('public')[1].replace(/\\/g, '/')}/${file}`);

    return NextResponse.json({ grayscaleImages });
  } catch (error) {
    console.error('Error in grayscale:', error);
    return NextResponse.json({ error: 'Failed to apply grayscale.' }, { status: 500 });
  }
}
