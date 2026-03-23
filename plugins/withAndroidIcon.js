const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

/**
 * Custom plugin to generate Android adaptive icons with proper sizing.
 * Creates foreground icons at 100% size (432x432 for xxxhdpi) with padding.
 */
module.exports = function withAndroidIcon(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = process.cwd();
      const sourceIcon = path.join(projectRoot, 'assets', 'adaptive-icon.png');
      const resDir = path.join(projectRoot, 'android', 'app', 'src', 'main', 'res');
      
      // Density configurations based on Android adaptive icon spec:
      // - Foreground: 108dp x 108dp
      // Source adaptive-icon.png is 512x512 with 50% content (256x256)
      // Scale 512px canvas to match 108dp at each density
      // Density multipliers: mdpi=1x, hdpi=1.5x, xhdpi=2x, xxhdpi=3x, xxxhdpi=4x
      const densities = {
        'mipmap-mdpi': { size: Math.round(108 * 1) },    // 108px
        'mipmap-hdpi': { size: Math.round(108 * 1.5) },  // 162px
        'mipmap-xhdpi': { size: Math.round(108 * 2) },   // 216px
        'mipmap-xxhdpi': { size: Math.round(108 * 3) },  // 324px
        'mipmap-xxxhdpi': { size: Math.round(108 * 4) }, // 432px
      };
      
      if (!fs.existsSync(sourceIcon)) {
        console.warn('⚠️ Source adaptive-icon.png not found');
        return config;
      }
      
      // Generate icons for each density
      for (const [density, { size }] of Object.entries(densities)) {
        const targetDir = path.join(resDir, density);
        
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
        
        const foregroundPath = path.join(targetDir, 'ic_launcher_foreground.webp');
        
        try {
          // Read source icon
          const metadata = await sharp(sourceIcon).metadata();
          
          // Resize to target size while maintaining aspect ratio
          await sharp(sourceIcon)
            .resize(size, size, {
              fit: 'contain',
              background: { r: 255, g: 255, b: 255, alpha: 0 }
            })
            .webp({ quality: 90 })
            .toFile(foregroundPath);
          
          console.log(`✓ Generated ${density}/ic_launcher_foreground.webp (${size}x${size})`);
        } catch (error) {
          console.error(`✗ Failed to generate ${density} icon:`, error.message);
        }
      }
      
      return config;
    },
  ]);
};
