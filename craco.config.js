// craco.config.js
module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // 1. Remove .raw.svg from the default SVG handling rule (SVGR)
      const oneOfRule = webpackConfig.module.rules.find(rule => Array.isArray(rule.oneOf));
      if (oneOfRule) {
        oneOfRule.oneOf.forEach((rule) => {
          if (
            rule.test &&
            rule.test.toString().includes('svg') &&
            rule.use &&
            rule.use.some &&
            rule.use.some(u => u.loader && u.loader.includes('svgr'))
          ) {
            rule.exclude = /\.raw\.svg$/i;
          }
        });

        // 2. Add a new rule to handle .raw.svg using raw-loader
        oneOfRule.oneOf.unshift({
          test: /\.raw\.svg$/i,
          use: 'raw-loader',
        });
      }

      return webpackConfig;
    },
  },
};
