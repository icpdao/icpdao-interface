// @ts-ignore
/* eslint-disable */
import { request } from 'umi';

/** 接收邀请 PUT /v1/users/icpperships/${param0}/accept */
export async function acceptIcpperships(
  params: {
    // path
    id: string;
  },
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.inlineResponse2002>(`/v1/users/icpperships/${param0}/accept`, {
    method: 'PUT',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 查询所有 icpper 邀请 GET /v1/users/icpperships */
export async function getIcpperships(options?: { [key: string]: any }) {
  return request<API.inlineResponse2003>('/v1/users/icpperships', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 发送邀请 POST /v1/users/icpperships */
export async function sendIcpperships(body: API.body1, options?: { [key: string]: any }) {
  return request<API.inlineResponse2002>('/v1/users/icpperships', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 删除邀请 DELETE /v1/users/icpperships/${param0} */
export async function removeIcpperships(
  params: {
    // path
    id: string;
  },
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.inlineResponse2004>(`/v1/users/icpperships/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}
