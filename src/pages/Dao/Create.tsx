import type { ReactNode } from 'react';
import { Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import * as AWS from '@aws-sdk/client-s3';

const { Dragger } = Upload;

const handleUplaod = (options: any) => {
  const { file } = options;

  const client = new AWS.S3({
    region: 'us-east-1',
    // 从后端拿到临时凭证 credentials
    credentials: {
      accessKeyId: 'xxx',
      secretAccessKey: 'xxx',
      sessionToken: 'xxx',
    },
  });
  const params = {
    Bucket: 'files.icpdao',
    Key: file.name,
    Body: file,
    ACL: 'public-read',
    ContentType: 'image/png',
  };
  client.putObject(params, (err, data) => {
    console.log(err, data);
  });
};

const props = {
  name: 'file',
  multiple: true,
  customRequest: handleUplaod,
};

export default (): ReactNode => {
  return (
    <Dragger {...props}>
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">Click or drag file to this area to upload</p>
      <p className="ant-upload-hint">
        Support for a single or bulk upload. Strictly prohibit from uploading company data or other
        band files
      </p>
    </Dragger>
  );
};
