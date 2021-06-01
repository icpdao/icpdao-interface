// @ts-ignore
/* eslint-disable */
import { request } from 'umi';

/** 获取上传文件到S3的临时token GET /v1/users/aws/sts/upload_s3_assume_role */
export async function uploadS3AssumeRole(options?: { [key: string]: any }) {
  return request<API.inlineResponse2005>('/v1/users/aws/sts/upload_s3_assume_role', {
    method: 'GET',
    ...(options || {}),
  });
}
