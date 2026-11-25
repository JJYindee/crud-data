import fs from 'fs';
import path from 'path';

const copyDir = (src, dest) => {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
};

const root = process.cwd();
const standaloneDir = path.join(root, '.next', 'standalone');

if (fs.existsSync(standaloneDir)) {
  copyDir(path.join(root, 'public'), path.join(standaloneDir, 'public'));
  copyDir(path.join(root, '.next', 'static'), path.join(standaloneDir, '.next', 'static'));
  if (fs.existsSync(path.join(root, '.env.local'))) {
    fs.copyFileSync(path.join(root, '.env.local'), path.join(standaloneDir, '.env.local'));
  }
  console.log('✓ Standalone assets copied successfully.');
}
