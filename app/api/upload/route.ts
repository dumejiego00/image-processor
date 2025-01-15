import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import AdmZip from 'adm-zip';

export const config = {
  api: {
    bodyParser: false,
  },
};

const getAllPngFiles = async (dir: string): Promise<string[]> => {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map(async (dirent) => {
      const res = path.resolve(dir, dirent.name);
      if (dirent.isDirectory() && dirent.name !== '__MACOSX') {
        return getAllPngFiles(res);  
      } else if (dirent.isFile() && path.extname(dirent.name).toLowerCase() === '.png') {
        return res;
      } else {
        return [];
      }
    })
  );
  return Array.prototype.concat(...files);
};

const getInvalidFiles = async (dir: string): Promise<string[]> => {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map(async (dirent) => {
      const res = path.resolve(dir, dirent.name);
      if (dirent.isDirectory() && dirent.name !== '__MACOSX') {
        return getInvalidFiles(res);
      } else if (dirent.isFile() && path.extname(dirent.name).toLowerCase() !== '.png') {
        return res;
      } else {
        return [];
      }
    })
  );
  return Array.prototype.concat(...files);
};

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded or file is invalid.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadDir = path.join(process.cwd(), '/public/uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    const zipPath = path.join(uploadDir, `${Date.now()}.zip`);
    await fs.writeFile(zipPath, buffer);

    const extractDir = path.join(uploadDir, path.basename(zipPath, '.zip'));
    await fs.mkdir(extractDir, { recursive: true });

    const zip = new AdmZip(zipPath);
    zip.extractAllTo(extractDir, true);

    const pngFiles = await getAllPngFiles(extractDir);
    const invalidFiles = await getInvalidFiles(extractDir);

    const imageUrls = pngFiles.map((filePath) =>
      `/uploads/${path.basename(zipPath, '.zip')}/${path.relative(extractDir, filePath)}`
    );

    const imagesDirPath = `public/uploads/${path.basename(zipPath, '.zip')}/images`;

    if (imageUrls.length === 0) {
      return NextResponse.json({
        error: 'No PNG images found in the ZIP file.',
      }, { status: 400 });
    }

    if (invalidFiles.length > 0) {
      const invalidFileNames = invalidFiles.map((filePath) =>
        path.relative(extractDir, filePath)
      );
      return NextResponse.json({
        imagesDirPath,
        images: imageUrls,
        warning: `Some files were not displayed because they are not PNG images: ${invalidFileNames.join(', ')}`,
      });
    }

    return NextResponse.json({
      imagesDirPath,
      images: imageUrls
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'File upload failed.' }, { status: 500 });
  }
}
