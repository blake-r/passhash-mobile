const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Copy Qt migration Kotlin files from plugins/native/android to generated android directory
 */
function copyQtMigrationFiles(config) {
  // Use process.cwd() as project root
  const projectRoot = process.cwd();

  // Source directory: plugins/native/android/ru/co_dev/passhash/
  const sourceDir = path.join(projectRoot, 'plugins', 'native', 'android', 'ru', 'co_dev', 'passhash');

  // Target directory: android/app/src/main/java/ru/co_dev/passhash/
  const targetDir = path.join(projectRoot, 'android', 'app', 'src', 'main', 'java', 'ru', 'co_dev', 'passhash');
  
  // Files to copy
  const filesToCopy = [
    'QtSettingsMigrationModule.kt',
    'QtSettingsMigrationPackage.kt',
  ];
  
  // Check if source directory exists
  if (!fs.existsSync(sourceDir)) {
    console.warn('⚠️ Qt migration source directory not found:', sourceDir);
    console.warn('   Skipping Qt migration files copy.');
    return config;
  }
  
  // Check if target directory exists (android may not be generated yet)
  if (!fs.existsSync(targetDir)) {
    console.warn('⚠️ Android target directory not found:', targetDir);
    console.warn('   Run "npx expo prebuild" first to generate android directory.');
    return config;
  }
  
  // Copy each file
  let copiedCount = 0;
  filesToCopy.forEach((filename) => {
    const sourceFile = path.join(sourceDir, filename);
    const targetFile = path.join(targetDir, filename);
    
    if (fs.existsSync(sourceFile)) {
      try {
        fs.copyFileSync(sourceFile, targetFile);
        console.log('✓ Copied Qt migration file:', filename);
        copiedCount++;
      } catch (error) {
        console.error('✗ Failed to copy', filename, ':', error.message);
      }
    } else {
      console.warn('⚠️ Source file not found:', sourceFile);
    }
  });
  
  if (copiedCount > 0) {
    console.log(`✓ Qt migration: ${copiedCount} file(s) copied`);
  }
  
  return config;
}

/**
 * Modify MainApplication.kt to register QtSettingsMigrationPackage
 */
function modifyMainApplication(config) {
  const projectRoot = process.cwd();
  const mainApplicationPath = path.join(
    projectRoot,
    'android',
    'app',
    'src',
    'main',
    'java',
    'ru',
    'co_dev',
    'passhash',
    'MainApplication.kt'
  );
  
  if (!fs.existsSync(mainApplicationPath)) {
    console.warn('⚠️ MainApplication.kt not found, skipping modification');
    return config;
  }
  
  try {
    let content = fs.readFileSync(mainApplicationPath, 'utf8');
    
    // Check if import already exists
    const importStatement = 'import ru.co_dev.passhash.QtSettingsMigrationPackage';
    if (!content.includes(importStatement)) {
      // Add import after package declaration
      const packageMatch = content.match(/(package\s+ru\.co_dev\.passhash\s*\n)/);
      if (packageMatch) {
        const insertPos = packageMatch.index + packageMatch[0].length;
        content = content.slice(0, insertPos) + importStatement + '\n' + content.slice(insertPos);
        console.log('✓ Added QtSettingsMigrationPackage import');
      }
    }
    
    // Check if package is already registered
    const registrationPattern = /add\(QtSettingsMigrationPackage\(\)\)/;
    if (!registrationPattern.test(content)) {
      // Find the packages() method and add our package
      const packagesPattern = /(override fun getPackages\(\): List<ReactPackage>\s*=\s*PackageList\(this\)\.packages\.apply\s*\{[^}]*)(\})/s;
      const match = content.match(packagesPattern);
      
      if (match) {
        const insertPos = match.index + match[0].length - 1; // Before closing brace
        const registration = '\n              add(QtSettingsMigrationPackage())\n';
        content = content.slice(0, insertPos) + registration + content.slice(insertPos);
        console.log('✓ Registered QtSettingsMigrationPackage');
      } else {
        console.warn('⚠️ Could not find packages() method in MainApplication.kt');
      }
    }
    
    fs.writeFileSync(mainApplicationPath, content, 'utf8');
  } catch (error) {
    console.error('✗ Failed to modify MainApplication.kt:', error.message);
  }
  
  return config;
}

/**
 * Expo config plugin to copy Qt migration files and modify MainApplication.kt
 */
const withQtMigration = (config) => {
  // Use dangerousMod to run after android directory is generated
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      copyQtMigrationFiles(config);
      modifyMainApplication(config);
      return config;
    },
  ]);
  
  return config;
};

module.exports = withQtMigration;
