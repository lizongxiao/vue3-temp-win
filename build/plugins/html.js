// 第三方静态资源CDN
const public_cdn_host = process.env.VUE_APP_EXT_CDN_HOST;
const ISProd = ['staging', 'production'].includes(process.env.NODE_ENV);
const HtmlWebpackPluginFn = (config) => {
  // 注入html
  config.plugin('html').tap((args) => {
    if (ISProd) {
      args[0].cdn = {
        css: [`//${public_cdn_host}/ant-design-vue/3.2.11/antd.min.css`],
        js: [
          `//${public_cdn_host}/echarts/5.0.2/echarts.min.js`,
          `//${public_cdn_host}/xlsx/0.16.9/xlsx.min.js`,
        ],
      };
      return args;
    } else {
      args[0].cdn = {
        css: [`//${public_cdn_host}/ant-design-vue/3.2.11/antd.min.css`],
      };
      return args;
    }
  });
};
module.exports = HtmlWebpackPluginFn;
