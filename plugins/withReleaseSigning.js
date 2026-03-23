const { withAppBuildGradle } = require('@expo/config-plugins');

/**
 * Config plugin to configure release signing for Android.
 * Reads keystore properties from environment variables or Gradle properties.
 */
module.exports = function withReleaseSigning(config) {
  return withAppBuildGradle(config, (config) => {
    const releaseSigningBlock = `
        release {
            def storePasswordVal = project.hasProperty('keystore.storePassword') ? project.property('keystore.storePassword') : System.getenv('KEYSTORE_STORE_PASSWORD')
            def keystorePathVal = project.hasProperty('keystore.path') ? project.property('keystore.path') : System.getenv('KEYSTORE_PATH')
            def aliasVal = project.hasProperty('keystore.alias') ? project.property('keystore.alias') : System.getenv('KEYSTORE_ALIAS')
            def keyPasswordVal = project.hasProperty('keystore.keyPassword') ? project.property('keystore.keyPassword') : System.getenv('KEYSTORE_KEY_PASSWORD')

            if (storePasswordVal && keystorePathVal && aliasVal) {
                storeFile file(keystorePathVal)
                storePassword storePasswordVal
                keyAlias aliasVal
                keyPassword keyPasswordVal ?: storePasswordVal
            } else if (System.getenv('DEBUG') == 'true') {
                println "DEBUG: Release signing not configured, skipping for debug build"
            } else {
                throw new GradleException("Release signing password is missing! Set KEYSTORE_STORE_PASSWORD, KEYSTORE_PATH, KEYSTORE_ALIAS in .env or pass -Pkeystore.storePassword=...")
            }
        }`;

    // Insert release signing config into signingConfigs block
    config.modResults.contents = config.modResults.contents.replace(
      /signingConfigs\s*\{/,
      `signingConfigs {${releaseSigningBlock}`
    );

    // Switch release buildType to use release signing
    config.modResults.contents = config.modResults.contents.replace(
      /(release\s*\{\s*\n\s*\/\/\s*Caution![\s\S]*?signingConfig\s+)signingConfigs\.debug/,
      '$1signingConfigs.release'
    );

    return config;
  });
};
