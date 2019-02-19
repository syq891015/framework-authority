'use strict'
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const path = require('path')
const baseWebpackConfig = require('./webpack.base.conf')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const portfinder = require('portfinder')

const HOST = process.env.HOST
const PORT = process.env.PORT && Number(process.env.PORT)

function getEntry () {
  let globPath = 'src/views/**/*.html'
  // (\/|\\\\) 这种写法是为了兼容 windows和 mac系统目录路径的不同写法
  let pathDir = 'src(\/|\\\\)views(\/|\\\\)(.*?)'
  let files = require("glob").sync(globPath)
  let dirname, entries = []
  for (let i = 0; i < files.length; i++) {
    dirname = path.dirname(files[i])
    entries.push(dirname.replace(new RegExp('^' + pathDir), '$3'))
  }
  return entries
}

const devWebpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap, usePostCSS: true })
  },
  // cheap-module-eval-source-map is faster for development
  devtool: config.dev.devtool,

  // these devServer options should be customized in /config/index.js
  devServer: {
    clientLogLevel: 'warning',
    historyApiFallback: {
      rewrites: [
        { from: /.*/, to: path.posix.join(config.dev.assetsPublicPath, 'index.html') },
      ],
    },
    hot: true,
    contentBase: false, // since we use CopyWebpackPlugin.
    compress: true,
    host: HOST || config.dev.host,
    port: PORT || config.dev.port,
    open: config.dev.autoOpenBrowser,
    overlay: config.dev.errorOverlay
      ? { warnings: false, errors: true }
      : false,
    publicPath: config.dev.assetsPublicPath,
    proxy: config.dev.proxyTable,
    quiet: true, // necessary for FriendlyErrorsPlugin
    watchOptions: {
      poll: config.dev.poll,
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': require('../config/dev.env')
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
    new webpack.NoEmitOnErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      chunks: ['index'],
      inject: true
    }),
    /*new HtmlWebpackPlugin({
      filename: 'baseDic.html',
      template: 'src/views/baseDic/baseDic.html',
      chunks: ['baseDic'],//html需要引入的js
      inject: true
    }),
    new HtmlWebpackPlugin({
      filename: 'config.html',
      template: 'src/views/config/config.html',
      chunks: ['config'],//html需要引入的js
      inject: true
    }),
    new HtmlWebpackPlugin({
      filename: 'dic.html',
      template: 'src/views/dic/dic.html',
      chunks: ['dic'],//html需要引入的js
      inject: true
    }),
    new HtmlWebpackPlugin({
      filename: 'menu.html',
      template: 'src/views/menu/menu.html',
      chunks: ['menu'],//html需要引入的js
      inject: true
    }),
    new HtmlWebpackPlugin({
      filename: 'role.html',
      template: 'src/views/role/role.html',
      chunks: ['role'],//html需要引入的js
      inject: true
    }),
    new HtmlWebpackPlugin({
      filename: 'user.html',
      template: 'src/views/user/user.html',
      chunks: ['user'],//html需要引入的js
      inject: true
    }),*/
    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: config.dev.assetsSubDirectory,
        ignore: ['.*']
      }
    ])
  ]
})

module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = process.env.PORT || config.dev.port
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err)
    } else {

      getEntry().forEach(item => {
        devWebpackConfig.plugins.push(
          new HtmlWebpackPlugin({
            filename: item + '.html',
            template: 'src/views/' + item + '/' + item + '.html',
            chunks: [item],//html需要引入的js
            inject: true
          })
        )
      })

      // publish the new Port, necessary for e2e tests
      process.env.PORT = port
      // add port to devServer config
      devWebpackConfig.devServer.port = port

      // Add FriendlyErrorsPlugin
      devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
        compilationSuccessInfo: {
          messages: [`Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`],
        },
        onErrors: config.dev.notifyOnErrors
        ? utils.createNotifierCallback()
        : undefined
      }))

      resolve(devWebpackConfig)
    }
  })
})
