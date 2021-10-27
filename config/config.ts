// https://umijs.org/config/
import { defineConfig } from 'umi';
import { join } from 'path';

import defaultSettings from './defaultSettings';
import proxy from './proxy';
import routes from './routes';
import winPath from 'slash2';

const {
  REACT_APP_ENV,
  UMI_ENV,
  REACT_APP_GITHUB_APP_CLIENT_ID,
  REACT_APP_ICPDAO_BACKEND_BASE_URL,
  THEME,
  REACT_APP_ICPDAO_BACKEND_VERSION,
  REACT_APP_ICPDAO_MOCK_URL,
  REACT_APP_ICPDAO_ETHEREUM_INFURA_KEY,
  REACT_APP_ICPDAO_ETHEREUM_ALCHEMY_KEY,
  REACT_APP_ICPDAO_ETHEREUM_ETHERSCAN_KEY,
  REACT_APP_ICPDAO_SENTRY_DSN,
  ICPDAO_MINT_TOKEN_ETH_CHAIN_ID,
} = process.env;

export default defineConfig({
  hash: true,
  antd: {},
  dva: {
    hmr: true,
  },
  define: {
    REACT_APP_GITHUB_APP_CLIENT_ID,
    REACT_APP_ICPDAO_BACKEND_BASE_URL: REACT_APP_ICPDAO_BACKEND_BASE_URL || '',
    THEME: THEME || undefined,
    REACT_APP_ICPDAO_BACKEND_VERSION: REACT_APP_ICPDAO_BACKEND_VERSION || 'v1',
    REACT_APP_ICPDAO_MOCK_URL: REACT_APP_ICPDAO_MOCK_URL || undefined,
    REACT_APP_ICPDAO_ETHEREUM_INFURA_KEY: REACT_APP_ICPDAO_ETHEREUM_INFURA_KEY || '',
    REACT_APP_ICPDAO_ETHEREUM_ALCHEMY_KEY: REACT_APP_ICPDAO_ETHEREUM_ALCHEMY_KEY || '',
    REACT_APP_ICPDAO_ETHEREUM_ETHERSCAN_KEY: REACT_APP_ICPDAO_ETHEREUM_ETHERSCAN_KEY || '',
    REACT_APP_ICPDAO_SENTRY_DSN: REACT_APP_ICPDAO_SENTRY_DSN || '',
    TEST_ENV_HOSTNAME: 'dev.app.icpdao.co',
    PROD_ENV_HOSTNAME: 'app.icpdao.co',
    UMI_ENV,
    ICPDAO_MINT_TOKEN_ETH_CHAIN_ID,
  },
  layout: {
    // https://umijs.org/zh-CN/plugins/plugin-layout
    locale: true,
    siderWidth: 208,
    ...defaultSettings,
  },
  // https://umijs.org/zh-CN/plugins/plugin-locale
  locale: {
    // default: 'zh-CN',
    default: 'en-US',
    antd: true,
    // default true, when it is true, will use `navigator.language` overwrite default
    baseNavigator: false,
  },
  dynamicImport: {
    loading: '@ant-design/pro-layout/es/PageLoading',
  },
  targets: {
    ie: 11,
  },
  // umi routes: https://umijs.org/docs/routing
  routes,
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    'primary-color': defaultSettings.primaryColor,
  },
  // esbuild is father build tools
  // https://umijs.org/plugins/plugin-esbuild
  esbuild: {},
  title: false,
  ignoreMomentLocale: true,
  proxy: proxy[REACT_APP_ENV || 'dev'],
  manifest: {
    basePath: '/',
  },
  // Fast Refresh 热更新
  fastRefresh: {},
  openAPI: [
    {
      requestLibPath: "import { request } from 'umi'",
      schemaPath: join(__dirname, 'icpdao-swagger.json'),
      mock: false,
    },
  ],
  cssLoader: {
    modules: {
      getLocalIdent: function getLocalIdent(context: any, _: any, localName: any) {
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
            .map(function (a: any) {
              return a.replace(/([A-Z])/g, '-$1');
            })
            .map(function (a: any) {
              return a.toLowerCase();
            });
          return 'antd-pro'.concat(arr.join('-'), '-').concat(localName).replace(/--/g, '-');
        }

        return localName;
      },
    },
  },
});
