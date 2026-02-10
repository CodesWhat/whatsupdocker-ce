const { defineConfig } = require("@vue/cli-service");
const webpack = require("webpack");

module.exports = defineConfig({
  parallel: false, // Disable parallel build to avoid Thread Loader errors
  devServer: {
    host: '0.0.0.0',
    proxy: {
      "^/api": {
        target: "http://localhost:3000",
        changeOrigin: true
      },
      "^/auth": {
        target: "http://localhost:3000",
        changeOrigin: true
      }
    }
  },

  pwa: {
    name: "drydock",
    themeColor: "#00355E",
    msTileColor: "#00355E",
    mobileWebAppCapable: "no",
    iconPaths: {
      faviconSVG: undefined,
      favicon96: undefined,
      favicon32: undefined,
      favicon16: undefined,
      appleTouchIcon: undefined,
      maskIcon: undefined,
      msTileImage: undefined
    },
    manifestOptions: {
      short_name: "drydock",
      background_color: "#00355E"
    }
  },

  chainWebpack: config => {
    // Prioritize .vue files
    config.resolve.extensions.prepend('.vue');
    config.plugin('fork-ts-checker').tap(args => {
      args[0].typescript = {
        ...args[0].typescript,
        configFile: 'tsconfig.build.json'
      }
      return args
    })

    config.module
      .rule('ts')
      .use('ts-loader')
      .loader('ts-loader')
      .tap(options => {
        return {
          ...options,
          configFile: 'tsconfig.build.json',
          appendTsSuffixTo: [/\.vue$/],
          transpileOnly: true
        }
      })
    return config
  },

  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        __VUE_OPTIONS_API__: "true",
        __VUE_PROD_DEVTOOLS__: "false",
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "false"
      })
    ]
  }
});
