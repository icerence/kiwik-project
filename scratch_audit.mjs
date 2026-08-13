import fs from 'node:fs';
import path from 'node:path';

const files = ['sub1-responsive.html', 'sub2-responsive.html', 'sub3-responsive.html', 'sub4-responsive.html', 'sub.html'];
const rootDir = process.cwd();

console.log('--- COMPREHENSIVE SUB 1-4 AUDIT REPORT ---');

for (const file of files) {
  const filePath = path.join(rootDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`[FAIL] ${file} does not exist!`);
    continue;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const hasCss = content.includes('common/components.css');
  const hasJs = content.includes('common/components.js');
  const hasFonts = content.includes('fonts.css');
  const hasHeader = content.includes('<!-- common:header:start -->') && content.includes('<!-- common:header:end -->');
  const hasFooter = content.includes('<!-- common:footer:start -->') && content.includes('<!-- common:footer:end -->');
  const hasViewport = content.includes('name="viewport"') || content.includes("name='viewport'");
  const hasTabletMedia = content.includes('max-width:1279px');
  const hasMobileMedia = content.includes('max-width:767px');
  const hasAbsPath = /C:\\|file:\/\/\//i.test(content);

  // Check referenced local image/asset paths
  const matches = [...content.matchAll(/src=["']([^"']+)["']/g)].map(m => m[1]);
  const missingAssets = matches.filter(src => !src.startsWith('http') && !src.startsWith('//') && !fs.existsSync(path.join(rootDir, src)));

  console.log(`\nFile: ${file}`);
  console.log(`- Common components.css: ${hasCss ? 'PASS' : 'FAIL'}`);
  console.log(`- Common components.js: ${hasJs ? 'PASS' : 'FAIL'}`);
  console.log(`- Fonts CSS (NanumSquare): ${hasFonts ? 'PASS' : 'FAIL'}`);
  console.log(`- Header synced region: ${hasHeader ? 'PASS' : 'FAIL'}`);
  console.log(`- Footer synced region: ${hasFooter ? 'PASS' : 'FAIL'}`);
  console.log(`- Viewport Meta: ${hasViewport ? 'PASS' : 'FAIL'}`);
  console.log(`- Tablet Responsive (@media 1279px): ${hasTabletMedia ? 'PASS' : 'FAIL'}`);
  console.log(`- Mobile Responsive (@media 767px): ${hasMobileMedia ? 'PASS' : 'FAIL'}`);
  console.log(`- No Absolute Paths (Portability): ${!hasAbsPath ? 'PASS' : 'FAIL'}`);
  console.log(`- Missing Local Asset Files: ${missingAssets.length === 0 ? '0 (ALL ASSETS PRESENT)' : missingAssets.join(', ')}`);
}
