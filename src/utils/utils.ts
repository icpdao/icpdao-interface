/* eslint no-useless-escape:0 import/prefer-default-export:0 */
import type { MenuTheme } from 'antd';
import moment from 'moment';

moment.locale('en');

const reg =
  /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

export const isUrl = (path: string): boolean => reg.test(path);

export const getAuthorization = () => {
  // 可能存在格式转换
  return window.localStorage.getItem('authorization');
};

export const setAuthorization = (jwt: string) => {
  // 可能存在格式转换
  return window.localStorage.setItem('authorization', jwt);
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

export const setHistoryBack = (params: any) => {
  return window.localStorage.setItem('history_back', JSON.stringify(params));
};

export const getHistoryBack: any = () => {
  return JSON.parse(window.localStorage.getItem('history_back') || '{}');
};

export const clearAuthorization = () => {
  // 可能存在格式转换
  window.localStorage.removeItem('authorization');
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

export const getFormatTime = (time: number, format: string): string => {
  return moment.unix(time).format(format);
};

export const getTimeZoneOffset = () => {
  return moment().utcOffset();
};

export const getTimeZone = () => {
  return moment.tz.guess();
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
  for (let i = 1; i < 24; i += 1) {
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

export const githubCallback = '/login/auth_callback';
export const getProfile = '/users/profile';
