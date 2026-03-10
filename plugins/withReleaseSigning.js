const { withAppBuildGradle } = require('@expo/config-plugins');

/**
 * Config plugin to configure release signing for Android.
 */
module.exports = function withReleaseSigning(config) {
  return withAppBuildGradle(config, (config) => {
    const releaseSigningBlock = `
        release {
            if (project.hasProperty('keystore.storePassword') && project.property('keystore.storePassword')) {
                storeFile file(project.property('keystore.path'))
                storePassword project.property('keystore.storePassword')
                keyAlias project.property('keystore.alias')
                keyPassword project.hasProperty('keystore.keyPassword') ? project.property('keystore.keyPassword') : project.property('keystore.storePassword')
            } else {
                throw new GradleException("Release signing password is missing! Pass -Pkeystore.storePassword=...")
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
