const { withAndroidManifest } = require("@expo/config-plugins");

/**
 * Hardware features that Play derives from the app config but that are not
 * essential for the app to run. Declaring them as optional keeps the app
 * available on devices that do not report them (Android TV, desktop mode,
 * Android XR).
 */
const OPTIONAL_FEATURES = ["android.hardware.screen.portrait"];

/**
 * Config plugin to mark derived hardware requirements as optional.
 * The activity stays locked to portrait; only the install-time filter is relaxed.
 */
module.exports = function withOptionalPortraitFeature(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    const features = manifest["uses-feature"] || [];

    OPTIONAL_FEATURES.forEach((name) => {
      const existing = features.find((feature) => feature.$ && feature.$["android:name"] === name);

      if (existing) {
        existing.$["android:required"] = "false";
        return;
      }

      features.push({
        $: {
          "android:name": name,
          "android:required": "false",
        },
      });
    });

    manifest["uses-feature"] = features;

    return config;
  });
};
