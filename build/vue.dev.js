'use strict';

const HtmlWebpackPluginFn = require('./plugins/html');
const path = require('path');
const join = (dir) => path.join(__dirname, dir);
const port = process.env.VUE_APP_PORT || process.env.npm_config_port || 1998;
const webpack = require('webpack');
const fs = require('fs');

module.exports = {
  publicPath: '/',
  outputDir: path.resolve(__dirname, '../pre-dist'),
  lintOnSave: false,
  productionSourceMap: false,
  devServer: {
    hot: true,
    client: {
      overlay: false,
    },
  },
  css: {
    extract: false,
    loaderOptions: {
      less: {
        lessOptions: {
          modifyVars: {
            // 用于全局导入，以避免需要分别导入每个样式文件。
            hack: `true; @import "${path.join(__dirname, '../src/design/config.less')}";`,
          },
          javascriptEnabled: true,
        },
      },
    },
  },
  configureWebpack: (config) => {
    const plugins = [];
    plugins.push(
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
      new webpack.ProvidePlugin({
        process: 'process/browser',
      })
    );
    config.plugins = [...config.plugins, ...plugins];
    config.devServer = {
      host: 'dev.com',
      port: port,
      https: {
        key:
          process.cwd().split('/')[1] === 'Users'
            ? fs.readFileSync(process.cwd().split('/', 3).join('/') + '/web/tools/dev.com.key')
            : '/web/tools/dev.com.key',
        cert:
          process.cwd().split('/')[1] === 'Users'
            ? fs.readFileSync(process.cwd().split('/', 3).join('/') + '/web/tools/dev.com.pem')
            : '/web/tools/dev.com.pem',
        requestCert: false,
        rejectUnauthorized: false,
      },
      // 使用Mock配置
      proxy: {
        [process.env.VUE_APP_BASE_API]: {
          target: 'https://dev.com',
          secure: false,
          changeOrigin: true,
        },
      },
    };
  },
  chainWebpack: (config) => {
    config.optimization.set('runtimeChunk', 'single');
    config.module
      .rule('bootstrap.ts')
      .test(/bootstrap\.ts$/)
      .include.add(path.resolve(__dirname, '../src'))
      .end()
      .use('bundle-loader')
      .loader('bundle-loader')
      .options({
        laze: true,
      });
    config.optimization.delete('splitChunks');
    // 处理svg
    config.module.rule('svg').exclude.add(join('../src/assets/icons/svgLoader')).end();
    // 处理icons
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(join('../src/assets/icons/svgLoader'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]',
      })
      .end();
    // 设置别名
    config.resolve.alias
      .set('/#/', join('../types') + '/')
      .set('ace/lib/es5-shim', 'ace-builds/src-noconflict/ace.js')
      .set('path', require.resolve('path-browserify'))
      .set('crypto', require.resolve('crypto-browserify'))
      .set('stream', require.resolve('stream-browserify'));
    HtmlWebpackPluginFn(config);
  },
};
