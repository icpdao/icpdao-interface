/** Request 网络请求工具 更详细的 api 文档: https://github.com/umijs/umi-request */
import type { RequestOptionsInit } from 'umi-request';
import { message, notification } from 'antd';
import type { RequestConfig } from 'umi';
import { history } from 'umi';
import { clearAuthorization, getAuthorization, getProfile } from '@/utils/utils';
import { getLocale } from 'umi';

const codeMessage: Record<number, string> = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

/**
 * @zh-CN 异常处理程序
 * @en-US Exception handler
 */
const errorHandler = (error: {
  response: Response;
  name: string;
  data: any;
  request: any;
}): Response => {
  const { response, name, data, request } = error;
  if (
    (name === 'BizError' && data.errorMessage === 'error.common.not_login') ||
    request.url.endsWith(getProfile)
  ) {
    clearAuthorization();
    history.replace('/');
    return response;
  }
  if (name === 'BizError') {
    notification.warn({
      message: `Request data not success, Error Message: ${data.errorMessage}`,
      description: false,
    });
    return response;
  }
  if (response && response.status) {
    const errorText = codeMessage[response.status] || response.statusText;
    const { status, url } = response;

    console.warn({
      message: `Request error ${status}: ${url}`,
      description: errorText,
    });
  } else if (!response) {
    // notification.error({
    //   description: 'Your network is abnormal and cannot connect to the server',
    //   message: 'Network anomaly',
    // });
  }
  if (data && data.errorMessage) {
    const intl = getLocale();
    import(`../locales/${intl}`).then((locales) => {
      console.warn({
        message: `Request error ${data.errorMessage}: ${response.url || ''}`,
      });
      message.error(locales.default[data.errorMessage] || data.errorMessage);
    });
  }
  return response;
};

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
  errorHandler, // default error handling
  credentials: 'same-origin', // Does the default request bring cookies
  requestInterceptors: [authHeaderInterceptor],
};

export default request;
