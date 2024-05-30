const HtmlWebpackPluginFn = require('./plugins/html');
const path = require('path');
const join = (dir) => path.join(__dirname, dir);
const pj_cdn_host = process.env.VUE_APP_PJ_CDN_HOST;
const webpack = require('webpack');

module.exports = {
  publicPath: pj_cdn_host ? `//${pj_cdn_host}/` : '/',
  // publicPath: '/', // 设置为'/'是为了方便本地使用nginx测试加载构建出来的文件
  outputDir: path.resolve(__dirname, '../pre-dist'),
  lintOnSave: false,
  productionSourceMap: false,
  css: {
    extract: {
      ignoreOrder: true,
    },
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
  chainWebpack: (config) => {
    config.output.chunkFilename(`js/[name].[contenthash:8].js`).end();
    config.output.filename(`js/[name].[contenthash:8].js`).end();
    config.cache = {
      type: 'filesystem',
      allowCollectingMemory: true,
    };
    // 使用 esbuild 编译 js 文件
    const rule = config.module.rule('js');
    // 清理自带的 babel-loader
    rule.uses.clear();
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

    config.optimization.minimize(true);
    config.optimization.minimizer('terser').tap((args) => {
      Object.assign(args[0].terserOptions.compress, {
        drop_console: true, // 删除console
        pure_funcs: ['console.log'],
      });
      return args;
    });

    // 删除底层 terser, 换用 esbuild-minimize-plugin
    config.optimization.minimizers.delete('terser');

    config.optimization.splitChunks({
      chunks: 'all',
      minSize: 30000,
      maxSize: 244000,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      cacheGroups: {
        libs: {
          name: 'chunk-libs',
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
          chunks: 'initial',
        },
        commons: {
          name: 'chunk-commons',
          test: path.resolve(__dirname, '../src/components'),
          minChunks: 3,
          priority: 5,
          reuseExistingChunk: true,
        },
      },
    });
    // 查看打包组件大小情况
    if (process.env.VUE_APP_BUNDLE_ANALYZE === 'true') {
      config
        .plugin('webpack-bundle-analyzer')
        .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin);
    }
  },
  configureWebpack: (config) => {
    // 添加插件
    const plugins = [];
    plugins.push(
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
      new webpack.ProvidePlugin({
        process: 'process/browser',
      })
    );
    config.externals = {
      xlsx: 'XLSX',
      echarts: 'echarts',
    };
  },
};
