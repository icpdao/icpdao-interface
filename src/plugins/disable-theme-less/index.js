const winPath = require('slash2');

export default function (api) {
  api.logger.info('use disable');
  api.skipPlugins(['umi-plugin-antd-theme']);
  api.modifyDefaultConfig(function (config) {
    config.cssLoader = {
      modules: {
        getLocalIdent: function getLocalIdent(context, _, localName) {
          if (
            context.resourcePath.includes('node_modules') ||
            context.resourcePath.includes('ant.design.pro.less') ||
            context.resourcePath.includes('global.less')
          ) {
            return localName;
          }

          const match = context.resourcePath.match(/src(.*)/);

          if (match && match[1]) {
            const antdProPath = match[1].replace('.less', '');
            const arr = winPath(antdProPath)
              .split('/')
              .map(function (a) {
                return a.replace(/([A-Z])/g, '-$1');
              })
              .map(function (a) {
                return a.toLowerCase();
              });
            return 'antd-pro'.concat(arr.join('-'), '-').concat(localName).replace(/--/g, '-');
          }

          return localName;
        },
      },
    };
    return config;
  }); // 给一个默认的配置
}
