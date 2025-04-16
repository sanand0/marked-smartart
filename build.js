import * as esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure dist directory exists
if (!fs.existsSync('./dist')) {
  fs.mkdirSync('./dist', { recursive: true });
}

// Copy plugin files to dist
const pluginFiles = ['pyramid.js', 'venn.js', 'chevron.js', 'utils.js', 'smartart-plugin.js'];
pluginFiles.forEach(file => {
  if (fs.existsSync(`./${file}`)) {
    fs.copyFileSync(`./${file}`, `./dist/${file}`);
    console.log(`Copied ${file} to dist folder`);
  } else {
    console.warn(`Warning: ${file} not found`);
  }
});

// Copy HTML file to dist with updated script reference
const htmlContent = fs.readFileSync('./index.html', 'utf8');
const updatedHtml = htmlContent.replace(
  '<script type="module" src="script.js"></script>',
  '<script type="module" src="bundle.js"></script>'
);
fs.writeFileSync('./dist/index.html', updatedHtml);
console.log('Created dist/index.html with updated script reference');

// Run esbuild
try {
  const result = await esbuild.build({
    entryPoints: ['script.js'],
    bundle: true,
    outfile: 'dist/bundle.js',
    format: 'esm',
    platform: 'browser',
    target: ['es2020'],
    minify: true,
    loader: { '.js': 'jsx' },
    define: {
      'process.env.NODE_ENV': '"production"'
    },
    // Important: Allow external CDN resources
    external: ['https://*'],
    // Handle WebContainer specifics
    metafile: true,
    sourcemap: true,
  });
  
  console.log('Build complete! Bundle size: ' + 
    (result.metafile.outputs['dist/bundle.js'].bytes / 1024).toFixed(2) + ' KB');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
