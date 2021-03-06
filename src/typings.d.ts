declare module 'slash2';
declare module '*.css';
declare module '*.less';
declare module '*.scss';
declare module '*.sass';
declare module '*.svg';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.bmp';
declare module '*.tiff';
declare module 'omit.js';
declare module 'numeral';
declare module '@antv/data-set';
declare module 'mockjs';
declare module 'react-fittext';
declare module 'bizcharts-plugin-slider';

// google analytics interface
type GAFieldsObject = {
  eventCategory: string;
  eventAction: string;
  eventLabel?: string;
  eventValue?: number;
  nonInteraction?: boolean;
};

type Window = {
  ga: (
    command: 'send',
    hitType: 'event' | 'pageview',
    fieldsObject: GAFieldsObject | string,
  ) => void;
  reloadAuthorized: () => void;
  routerBase: string;
};

declare let ga: () => void;

// preview.pro.ant.design only do not use in your production ;
// preview.pro.ant.design 专用环境变量，请不要在你的项目中使用它。
declare let ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION: 'site' | undefined;

declare const REACT_APP_ENV: 'test' | 'dev' | 'pre' | false;
declare const UMI_ENV: 'test' | 'dev' | 'pre' | false;
declare const REACT_APP_GITHUB_APP_CLIENT_ID: string;
declare const REACT_APP_ICPDAO_BACKEND_BASE_URL: string;
declare const THEME: string | undefined;
declare const REACT_APP_ICPDAO_BACKEND_VERSION: string;
declare const REACT_APP_ICPDAO_MOCK_URL: string | undefined;
declare const REACT_APP_ICPDAO_ETHEREUM_INFURA_KEY: string;
declare const REACT_APP_ICPDAO_ETHEREUM_ALCHEMY_KEY: string;
declare const REACT_APP_ICPDAO_ETHEREUM_ETHERSCAN_KEY: string;
declare const REACT_APP_ICPDAO_SENTRY_DSN: string;
declare const TEST_ENV_HOSTNAME: string;
declare const PROD_ENV_HOSTNAME: string;
declare const ICPDAO_MINT_TOKEN_ETH_CHAIN_ID: string;
declare const ICPDAO_ENV: string;
