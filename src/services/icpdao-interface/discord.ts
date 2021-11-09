// @ts-ignore
/* eslint-disable */
import { request } from 'umi';

export async function bindDiscord(
  params: {
    // path
    bindId: string;
  },
  options?: { [key: string]: any },
) {
  const { bindId: param0, ...queryParams } = params;
  return request(`/v1/users/connect/discord/${param0}`, {
    method: 'PUT',
    params: { ...queryParams },
    ...(options || {}),
  });
}
