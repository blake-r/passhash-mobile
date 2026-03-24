const { withInfoPlist, withAndroidManifest } = require('@expo/config-plugins');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Call compute-version.sh and parse output to get version info
 */
function computeVersion(config) {
  // Use process.cwd() as project root (where expo is run from)
  const projectRoot = process.cwd();
  const scriptPath = path.join(projectRoot, 'scripts', 'compute-version.sh');

  try {
    const output = execSync(`bash "${scriptPath}"`, {
      encoding: 'utf8',
      cwd: projectRoot,
    });

    const versionIOSMatch = output.match(/VERSION_IOS: ([\d.]+)/);
    const versionNameMatch = output.match(/VERSION_NAME: ([\d.]+)/);
    const versionCodeMatch = output.match(/VERSION_CODE: (\d+)/);

    if (versionIOSMatch && versionNameMatch && versionCodeMatch) {
      return {
        version: versionIOSMatch[1],        // iOS: CFBundleShortVersionString
        versionName: versionNameMatch[1],   // Android: versionName
        versionCode: versionCodeMatch[1],   // Android: versionCode
      };
    }
  } catch (error) {
    console.warn('⚠️ Could not run compute-version.sh:', error.message);
  }

  // Fallback
  return { version: '1.0.0', versionName: '1.0.0', versionCode: '1' };
}

/**
 * Expo config plugin to set computed version
 */
const withVersion = (config) => {
  const { version, versionName, versionCode } = computeVersion(config);

  // Set version in expo config (use versionName for Android compatibility)
  config.version = versionName;

  // Set iOS: VERSION → CFBundleShortVersionString
  config = withInfoPlist(config, (config) => {
    config.modResults.CFBundleShortVersionString = version;
    config.modResults.CFBundleVersion = versionCode;
    return config;
  });

  // Set Android: VERSION_NAME → versionName, VERSION_CODE → versionCode
  config = withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults.manifest;
    androidManifest.$['android:versionCode'] = versionCode;
    androidManifest.$['android:versionName'] = versionName;
    return config;
  });

  return config;
};

module.exports = withVersion;
