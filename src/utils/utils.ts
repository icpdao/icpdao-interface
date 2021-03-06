import type { MenuTheme } from 'antd';
import moment from 'moment';
import momentTZ from 'moment-timezone';
import { InjectedConnector } from '@web3-react/injected-connector';

moment.locale('en');

export const MaxCycleEndAt = 2147483647;

const reg =
  /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

export const isUrl = (path: string): boolean => reg.test(path);

export const setMetamaskDisconnect = () => {
  return window.localStorage.setItem('metamask', '0');
};

export const setMetamaskConnect = () => {
  const expiresAt = moment.now() + 43200;
  return window.localStorage.setItem('metamask', expiresAt.toString(10));
};

export const setRedirectURL = (redirect: string) => {
  return window.localStorage.setItem('redirect', redirect);
};

export const getRedirectURL = () => {
  return window.localStorage.getItem('redirect');
};

export const setNewJobExpertMode = () => {
  return window.localStorage.setItem('new_job_expert_mode', '1');
};

export const clearNewJobExpertMode = () => {
  return window.localStorage.setItem('new_job_expert_mode', '');
};

export const getNewJobExpertMode = () => {
  return !!window.localStorage.getItem('new_job_expert_mode');
};

export const getMetamask = () => {
  return parseInt(window.localStorage.getItem('metamask') || '0', 10) >= moment.now();
};

export const getAuthorization = () => {
  // 可能存在格式转换
  return window.localStorage.getItem('authorization');
};

export const getAuthorizationExpiresAt = () => {
  // 可能存在格式转换
  return parseInt(window.localStorage.getItem('authorization_expires_at') || '0', 10);
};

export const setAuthorization = (jwt: string) => {
  // 可能存在格式转换
  return window.localStorage.setItem('authorization', jwt);
};

export const setAuthorizationExpiresAt = (expiresAt: number) => {
  // 可能存在格式转换
  return window.localStorage.setItem('authorization_expires_at', expiresAt.toString());
};

export const getUserInfo = () => {
  return JSON.parse(window.localStorage.getItem('user_info') || '{}');
};

export const setUserProfile = (profile: API.UserProfile) => {
  const userInfo = getUserInfo();
  userInfo.profile = profile;
  return window.localStorage.setItem('user_info', JSON.stringify(userInfo));
};

export const clearUserProfile = () => {
  setUserProfile({});
};

export const getCacheMintRecordBindTxHash = () => {
  return JSON.parse(window.localStorage.getItem('cache_mint_record_bind_tx_hash') || '{}');
};

export const setCacheMintRecordBindTxHash = (recordId: string, txHash: string) => {
  return window.localStorage.setItem(
    'cache_mint_record_bind_tx_hash',
    JSON.stringify({
      recordId,
      txHash,
    }),
  );
};

export const clearCacheMintRecordBingTxHash = () => {
  return window.localStorage.setItem('cache_mint_record_bind_tx_hash', JSON.stringify({}));
};

export const setHistoryBack = (params: any) => {
  return window.localStorage.setItem('history_back', JSON.stringify(params));
};

export const getHistoryBack: any = () => {
  return JSON.parse(window.localStorage.getItem('history_back') || '{}');
};

export const clearAuthorization = () => {
  // 可能存在格式转换
  window.localStorage.removeItem('authorization');
  window.localStorage.removeItem('authorization_expires_at');
  return clearUserProfile();
};

export const getTheme = () => {
  return (window.localStorage.getItem('site-theme') || 'light') as MenuTheme;
};

// timeA - timeB
export const getTimeDistance = (timeA: number, timeB: number): string => {
  const a = moment.unix(timeA);
  const b = moment.unix(timeB);
  const dura = moment.duration(a.diff(b, 'seconds'), 'seconds');
  return dura.locale('en').humanize();
};

export const getTimeDistanceDays = (timeA: number, timeB: number): number => {
  const a = moment.unix(timeA);
  const b = moment.unix(timeB);
  return Math.round(moment.duration(a.diff(b, 'seconds'), 'seconds').asDays());
};

export const getTimeDistanceHumanize = (time: number): string => {
  const a = moment.utc();
  const b = moment.unix(time);
  // return moment.duration(b.diff(a)).humanize();
  let diff = Math.abs(Math.floor(b.diff(a) / 1000));
  const days = Math.floor(diff / (60 * 60 * 24));
  diff -= days * 60 * 60 * 24;
  const hours = Math.floor(diff / (60 * 60));
  diff -= hours * 60 * 60;
  const minutes = Math.floor(diff / 60);

  let res = '';
  if (days > 0) {
    res += `${days} days`;
  }
  if (hours > 0) {
    res += ` ${hours} hours`;
  }
  if (minutes > 0) {
    res += ` ${minutes} minutes`;
  }
  return res;
};

export const getFormatTime = (time: number, format: string): string => {
  return moment.unix(time).format(format);
};

export const getFormatTimeByZone = (time: number, timeZone: number, format: string): string => {
  return moment.unix(time).utcOffset(timeZone).format(format);
};

export const getTimestamp = () => {
  return moment.utc().valueOf();
};

export const getTimestampByZone = (time: number, timeZone: number) => {
  return moment.unix(time).utcOffset(timeZone).unix();
};

export const getTimeZoneOffset = () => {
  return moment().utcOffset();
};

export const getTimeZone = () => {
  return momentTZ.tz.guess();
};

export const getHourStr = (hour: number) => {
  return hour < 10 ? `0${hour}` : hour.toString();
};

export const getDayStr = (day: number | undefined) => {
  let label;
  if (day === 1) label = '1st';
  else if (day === 2) label = '2nd';
  else if (day === 3) label = '3rd';
  else label = `${day}th`;
  return label;
};

export const getHours = () => {
  const hours = [];
  for (let i = 0; i < 24; i += 1) {
    hours.push({
      value: i,
      label: getHourStr(i),
    });
  }
  return hours;
};

export const getDaysHours = () => {
  const hoursOptions = getHours();
  const ops = [];
  for (let i = 1; i < 28; i += 1) {
    ops.push({
      value: i,
      label: getDayStr(i),
      children: hoursOptions,
    });
  }
  return ops;
};

export const getEIColor = (ei: number) => {
  let voteEIColor: string = 'inherit';
  if (ei < 0.4) {
    voteEIColor = '#ED6C6C';
  } else if (ei < 0.8) {
    voteEIColor = '#F1C84C';
  } else if (ei >= 1.2) {
    voteEIColor = '#2CA103';
  }
  return voteEIColor;
};

export const getCurrentPage = (offset: number, pageSize: number) => {
  return Math.ceil(offset / pageSize) + 1;
};

export const getCurrentTimestamps = () => {
  return parseInt(String(new Date().getTime() / 1000), 10);
};

export const githubCallback = '/login/auth_callback';
export const getProfile = '/users/profile';

export const EthereumNetwork = {
  '0x1': 'homestead',
  '0x3': 'ropsten',
  '0x4': 'rinkeby',
  '0x5': 'goerli',
  '0x2a': 'kovan',
  '0x89': 'matic',
  '0x13881': 'maticmum',
};

export const EthereumNetworkById = {
  1: 'homestead',
  3: 'ropsten',
  4: 'rinkeby',
  5: 'goerli',
  42: 'kovan',
  137: 'matic',
  80001: 'maticmum',
};

export const EthereumChainId = {
  homestead: 1,
  ropsten: 3,
  rinkeby: 4,
  goerli: 5,
  kovan: 42,
  matic: 137,
  maticmum: 80001,
};

export const Injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42, 137, 80001],
});
