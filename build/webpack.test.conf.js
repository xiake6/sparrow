'use strict'
/**
 * webpack的测试环境配置文件
 * 用于unit test
 */
const {styleLoaders} = require('../engineering/utils')
const webpack = require('webpack')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')

const testWebpackConfig = merge(baseWebpackConfig, {
  // use inline sourcemap for karma-sourcemap-loader
  module: {
    rules: styleLoaders()
  },
  devtool: '#inline-source-map',
  resolveLoader: {
    alias: {
      // necessary to to make lang="scss" work in test when using vue-loader's ?inject option
      // see discussion at https://github.com/vuejs/vue-loader/issues/724
      'scss-loader': 'sass-loader'
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': require('./definePlugin/test.env')
    })
  ]
})

// no need for app entry during tests
delete testWebpackConfig.entry

module.exports = testWebpackConfig
