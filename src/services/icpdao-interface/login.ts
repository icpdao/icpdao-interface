// @ts-ignore
/* eslint-disable */
import { request } from 'umi';

/** github app callback GET /v1/users/github/auth_callback */
export async function githubCallback(
  params: {
    // query
    code: string;
  },
  options?: { [key: string]: any },
) {
  return request<API.inlineResponse200>('/v1/users/github/auth_callback', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
