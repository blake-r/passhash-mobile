const { withAppBuildGradle } = require("@expo/config-plugins");

const DEFAULT_RULES = 'getDefaultProguardFile("proguard-android.txt")';
const OPTIMIZE_RULES = 'getDefaultProguardFile("proguard-android-optimize.txt")';

module.exports = function withR8Optimization(config) {
  return withAppBuildGradle(config, (config) => {
    const contents = config.modResults.contents;
    if (!contents.includes(DEFAULT_RULES)) {
      throw new Error(
        `withR8Optimization: expected ${DEFAULT_RULES} in android/app/build.gradle; the Expo template changed, update this plugin`,
      );
    }
    config.modResults.contents = contents.replace(DEFAULT_RULES, OPTIMIZE_RULES);
    return config;
  });
};
