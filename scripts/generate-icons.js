const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ICON_SVG_SOURCE = path.join(__dirname, '../assets/icon-source.svg');
const ICON_SOURCE = path.join(__dirname, '../assets/icon.png');
const ANDROID_ICON_SOURCE = path.join(__dirname, '../assets/adaptive-icon.png');
const SPLASH_ICON = path.join(__dirname, '../assets/splash-icon.png');
const FAVICON = path.join(__dirname, '../assets/favicon.png');
const ASSETS_DIR = path.join(__dirname, '../assets');
const IOS_ICONS_DIR = path.join(__dirname, '../ios/passhashmobile/Images.xcassets/AppIcon.appiconset');
const ANDROID_ICONS_DIR = path.join(__dirname, '../android/app/src/main/res');

// iOS icon sizes from original Contents.json
const IOS_ICON_SIZES = [20, 29, 40, 58, 60, 80, 87, 120, 152, 167, 180, 1024];

// Android icon sizes (mipmap densities)
const ANDROID_DENSITIES = {
  'mdpi': 48,
  'hdpi': 72,
  'xhdpi': 96,
  'xxhdpi': 144,
  'xxxhdpi': 192,
  'mipmap-512': 512,
};

async function generateIOSIcons() {
  console.log('Generating iOS icons...');
  
  // Run expo prebuild to create iOS directory
  const { execSync } = require('child_process');
  try {
    console.log('  Running npx expo prebuild --platform ios...');
    execSync('npx expo prebuild --platform ios --clean', { 
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe'
    });
  } catch (error) {
    // Extract bundleIdentifier from app.json
    const appJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../app.json'), 'utf8'));
    const bundleId = appJson.expo.ios.bundleIdentifier;
    
    console.log('  Retrying with corrected bundle identifier...');
    try {
      execSync(`npx expo prebuild --platform ios --clean`, { 
        cwd: path.join(__dirname, '..'),
        stdio: 'pipe'
      });
    } catch (retryError) {
      console.log('  Warning: Could not run expo prebuild. Make sure ios directory exists.');
      return;
    }
  }

  if (!fs.existsSync(IOS_ICONS_DIR)) {
    console.log('  iOS icons directory does not exist after prebuild. Skipping.');
    return;
  }

  // Clear existing icons (keep Contents.json)
  const existingIcons = fs.readdirSync(IOS_ICONS_DIR).filter(f => f.endsWith('.png'));
  existingIcons.forEach(icon => fs.unlinkSync(path.join(IOS_ICONS_DIR, icon)));

  for (const size of IOS_ICON_SIZES) {
    const filename = `${size}.png`;
    const filepath = path.join(IOS_ICONS_DIR, filename);
    
    await sharp(ICON_SOURCE)
      .resize(Math.round(size), Math.round(size))
      .png()
      .toFile(filepath);
    
    console.log(`  Generated: ${filename}`);
  }
  
  console.log('  ✓ iOS icons generated. Run "git clean -fd ios/" to remove after build.');
}

async function generateAndroidIcons() {
  console.log('Generating Android icons...');
  
  // Run expo prebuild to create Android directory
  const { execSync } = require('child_process');
  try {
    console.log('  Running npx expo prebuild --platform android...');
    execSync('npx expo prebuild --platform android --clean', { 
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe'
    });
  } catch (error) {
    console.log('  Warning: Could not run expo prebuild. Make sure android directory exists.');
    return;
  }

  if (!fs.existsSync(ANDROID_ICONS_DIR)) {
    console.log('  Android icons directory does not exist after prebuild. Skipping.');
    return;
  }

  for (const [density, size] of Object.entries(ANDROID_DENSITIES)) {
    const mipmapDir = path.join(ANDROID_ICONS_DIR, `mipmap-${density}`);
    
    if (!fs.existsSync(mipmapDir)) {
      console.log(`  Skipping ${density}: directory does not exist`);
      continue;
    }

    const filepath = path.join(mipmapDir, 'ic_launcher.png');
    
    await sharp(ANDROID_ICON_SOURCE)
      .resize(size, size)
      .png()
      .toFile(filepath);
    
    console.log(`  Generated: mipmap-${density}/ic_launcher.png (${size}x${size})`);
  }
  
  console.log('  ✓ Android icons generated. Run "git clean -fd android/" to remove after build.');
}

// Adaptive-icon foreground must fit inside the 66% safe-zone circle.
const ADAPTIVE_GLYPH_SCALE = 0.62;

async function renderAssetsFromSvg() {
  console.log('Rendering assets from SVG source...');

  const svg = fs.readFileSync(ICON_SVG_SOURCE, 'utf8');
  const glyphMatch = svg.match(/<g id="glyph"[\s\S]*<\/g>\s*<\/svg>/);
  if (!glyphMatch) {
    throw new Error('icon-source.svg: <g id="glyph"> group not found');
  }
  const glyph = glyphMatch[0].replace(/<\/svg>\s*$/, '');

  // Full icon with background (store listing, iOS, legacy launcher)
  await sharp(ICON_SVG_SOURCE, { density: 768 })
    .resize(1024, 1024)
    .png()
    .toFile(ICON_SOURCE);
  console.log('  Generated: assets/icon.png (1024x1024)');

  // Transparent foreground: glyph only, scaled into the adaptive safe zone
  const defsMatch = svg.match(/<defs>[\s\S]*?<\/defs>/);
  const foregroundSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    ${defsMatch ? defsMatch[0] : ''}
    <g transform="translate(256 256) scale(${ADAPTIVE_GLYPH_SCALE}) translate(-256 -256)">
      ${glyph}
    </g>
  </svg>`;
  const foreground = sharp(Buffer.from(foregroundSvg), { density: 384 });

  await foreground.clone().resize(512, 512).png().toFile(ANDROID_ICON_SOURCE);
  console.log('  Generated: assets/adaptive-icon.png (512x512, safe-zone foreground)');

  await foreground.clone().resize(384, 384).png().toFile(SPLASH_ICON);
  console.log('  Generated: assets/splash-icon.png (384x384)');

  await sharp(ICON_SVG_SOURCE, { density: 192 })
    .resize(48, 48)
    .png()
    .toFile(FAVICON);
  console.log('  Generated: assets/favicon.png (48x48)');
}

async function main() {
  try {
    await renderAssetsFromSvg();
    await generateIOSIcons();
    await generateAndroidIcons();
    console.log('\n✓ Icons generation complete!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

main();
