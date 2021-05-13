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

/** 更新用户基础信息 PUT /v1/users/profile */
export async function updateUserProfile(body: API.body, options?: { [key: string]: any }) {
  return request<API.inlineResponse2001>('/v1/users/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
