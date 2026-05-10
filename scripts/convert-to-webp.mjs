import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directories to scan
const targetDirs = [
  path.join(__dirname, '../public/photos'),
  path.join(__dirname, '../public/videos'),
];

const supportedExtensions = ['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'];

async function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`Directory does not exist, skipping: ${dirPath}`);
    return;
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      await processDirectory(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      
      if (supportedExtensions.includes(ext)) {
        const webpPath = fullPath.substring(0, fullPath.lastIndexOf('.')) + '.webp';
        
        // Skip if WebP already exists
        if (!fs.existsSync(webpPath)) {
          console.log(`Converting: ${fullPath} -> ${webpPath}`);
          try {
            await sharp(fullPath)
              .webp({ quality: 100 }) // 100 ensures max quality as requested
              .toFile(webpPath);
            
            // Delete original file to save space (since user agreed)
            fs.unlinkSync(fullPath);
            console.log(`Deleted original: ${fullPath}`);
          } catch (err) {
            console.error(`Failed to convert ${fullPath}:`, err);
          }
        }
      }
    }
  }
}

async function run() {
  console.log('Starting high-quality WebP conversion...');
  for (const dir of targetDirs) {
    await processDirectory(dir);
  }
  console.log('Conversion complete!');
}

run();
