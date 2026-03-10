/**
 * Prepare dist/ folder for production deployment.
 *
 * After `vite build`, this script copies server files into dist/ so you
 * can upload a single folder:
 *
 *   dist/
 *   ├── server.js          ← Express server (API + static serving)
 *   ├── .env.local          ← Cashfree production keys
 *   ├── package.json        ← Minimal dependencies for server
 *   ├── public/             ← Your built frontend (HTML/JS/CSS)
 *   │   ├── index.html
 *   │   └── assets/
 *   └── node_modules/       ← (install on server: npm install --production)
 *
 * Usage:
 *   npm run build:deploy
 *   cd dist && npm install --production
 *   node server.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

function copyFile(src, dest) {
  fs.copyFileSync(src, dest);
  console.log(`  ✓ ${path.relative(ROOT, src)} → dist/${path.relative(DIST, dest)}`);
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

console.log('\n📦 Preparing dist/ for deployment...\n');

// 1. Move built files (index.html, assets/) into dist/public/
const publicDir = path.join(DIST, 'public');
ensureDir(publicDir);

// Move index.html
if (fs.existsSync(path.join(DIST, 'index.html'))) {
  fs.renameSync(path.join(DIST, 'index.html'), path.join(publicDir, 'index.html'));
  console.log('  ✓ index.html → dist/public/index.html');
}

// Move assets/
const assetsDir = path.join(DIST, 'assets');
if (fs.existsSync(assetsDir)) {
  const destAssets = path.join(publicDir, 'assets');
  ensureDir(destAssets);
  for (const file of fs.readdirSync(assetsDir)) {
    fs.renameSync(path.join(assetsDir, file), path.join(destAssets, file));
  }
  fs.rmdirSync(assetsDir);
  console.log('  ✓ assets/ → dist/public/assets/');
}

// Move any other static files (favicon, images, etc.)
for (const item of fs.readdirSync(DIST)) {
  const itemPath = path.join(DIST, item);
  if (item === 'public' || item === 'server.js' || item === '.env.local' || item === 'package.json' || item === 'node_modules') continue;
  const stat = fs.statSync(itemPath);
  if (stat.isFile()) {
    fs.renameSync(itemPath, path.join(publicDir, item));
    console.log(`  ✓ ${item} → dist/public/${item}`);
  } else if (stat.isDirectory()) {
    const destDir = path.join(publicDir, item);
    ensureDir(destDir);
    // Simple recursive copy for directories
    copyDirRecursive(itemPath, destDir);
    fs.rmSync(itemPath, { recursive: true });
    console.log(`  ✓ ${item}/ → dist/public/${item}/`);
  }
}

// 2. Copy server.js
copyFile(path.join(ROOT, 'server', 'index.js'), path.join(DIST, 'server.js'));

// 3. Copy .env.local (Cashfree keys)
const envLocal = path.join(ROOT, 'server', '.env.local');
if (fs.existsSync(envLocal)) {
  copyFile(envLocal, path.join(DIST, '.env.local'));
}

// 4. Create minimal package.json for server
const serverPkg = {
  name: 'volosist-server',
  version: '1.0.0',
  type: 'module',
  scripts: {
    start: 'node server.js',
  },
  dependencies: {
    cors: '^2.8.5',
    dotenv: '^16.6.1',
    express: '^4.21.2',
  },
};
fs.writeFileSync(path.join(DIST, 'package.json'), JSON.stringify(serverPkg, null, 2));
console.log('  ✓ Created dist/package.json');

console.log('\n✅ dist/ is ready for deployment!');
console.log('\n   To deploy:');
console.log('   1. Upload the dist/ folder to your server');
console.log('   2. cd dist && npm install --production');
console.log('   3. node server.js');
console.log(`   4. Site runs on port ${process.env.PORT || 3001}\n`);

function copyDirRecursive(src, dest) {
  for (const item of fs.readdirSync(src)) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    if (fs.statSync(srcPath).isDirectory()) {
      ensureDir(destPath);
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
