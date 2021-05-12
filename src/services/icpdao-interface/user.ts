// @ts-ignore
/* eslint-disable */
import { request } from 'umi';

/** 查询个人基础信息 GET /v1/users/profile */
export async function getUserProfile(options?: { [key: string]: any }) {
  return request<API.inlineResponse2001>('/v1/users/profile', {
    method: 'GET',
    ...(options || {}),
  });
}
