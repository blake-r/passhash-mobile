const { withAndroidStyles } = require("@expo/config-plugins");

module.exports = function withEdgeToEdgeStatusBar(config) {
  return withAndroidStyles(config, (config) => {
    for (const style of config.modResults.resources.style ?? []) {
      if (style.$.name === "AppTheme" && Array.isArray(style.item)) {
        style.item = style.item.filter((item) => item.$.name !== "android:statusBarColor");
      }
    }
    return config;
  });
};
