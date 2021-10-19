/** Request 网络请求工具 更详细的 api 文档: https://github.com/umijs/umi-request */
import type { RequestOptionsInit } from 'umi-request';
import type { RequestConfig } from 'umi';
import { history } from 'umi';
import { clearAuthorization, getAuthorization, getProfile } from '@/utils/utils';
import { getLocale } from 'umi';
import enLocales from '../locales/en-US';
import zhLocales from '../locales/zh-CN';

const locales = {
  'en-US': enLocales,
  'zh-CN': zhLocales,
}[getLocale() || 'en-US'];

const authHeaderInterceptor = (url: string, options: RequestOptionsInit) => {
  const auth = getAuthorization();
  const prefix = url.startsWith('http') ? '' : REACT_APP_ICPDAO_BACKEND_BASE_URL;
  if (auth && prefix !== '') {
    return {
      url: `${prefix}${url}`,
      options: { ...options, interceptors: true, headers: { Authorization: `${auth}` } },
    };
  }
  return { url: `${prefix}${url}`, options };
};

/**
 * @en-US Configure the default parameters for request
 * @zh-CN 配置request请求时的默认参数
 */
const request: RequestConfig = {
  // errorHandler, // default error handling
  credentials: 'same-origin', // Does the default request bring cookies
  requestInterceptors: [authHeaderInterceptor],
  errorConfig: {
    adaptor: (resData, ctx) => {
      if (
        resData?.errorMessage === 'error.common.not_login' ||
        (resData?.success === false && ctx.req.url.endsWith(getProfile))
      ) {
        clearAuthorization();
        history.replace('/');
        return {
          success: true,
          data: {},
        };
      }
      if (resData?.success === false && resData?.errorMessage) {
        return {
          ...resData,
          errorMessage: locales[resData?.errorMessage] || 'unknown error',
        };
      }
      return {
        ...resData,
      };
    },
  },
};

export default request;
