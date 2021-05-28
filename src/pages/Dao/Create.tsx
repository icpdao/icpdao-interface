import type { ReactNode } from 'react';
import React, { useState, useEffect, useRef, useMemo } from 'react';

import { Upload, Form, Input, Button, Space } from 'antd';

import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';

import * as AWS from '@aws-sdk/client-s3';

import styles from './Create.less';

import GlobalTooltip from '@/components/Tooltip';

const { Dragger } = Upload;

const AwsS3Bucket = 'dev.files.icpdao';
const AwsS3region = 'us-east-1';
const AwsS3FileBucketHost = 'https://s3.amazonaws.com';

const getAwsS3UrlByKey = (key) => {
  return `${AwsS3FileBucketHost}/${AwsS3Bucket}/${key}`;
};

export type onUploadSuccessFunType = (url: string) => void;
export interface AvatarUploadProps {
  onUploadSuccess: onUploadSuccessFunType;
  initlogoUrl: string;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ onUploadSuccess, initlogoUrl }) => {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleChange = (info: any) => {
    const { file } = info;
    if (file.status === 'uploading') {
      setUploading(true);
      return;
    }
    if (file.status === 'done') {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageUrl(reader.result);
        setUploading(false);
      });
      reader.readAsDataURL(file.originFileObj);
      onUploadSuccess(getAwsS3UrlByKey(file.fileAwsKey));
    }
  };

  const handleUplaod = (options: any) => {
    const { file, onProgress, onSuccess } = options;

    file.fileAwsKey = `avatar/${file.uid}`;
    onProgress(file, 0);

    new Promise((resolve) => {
      setTimeout(() => {
        // 从服务取得临时token
        resolve({
          accessKeyId: 'xxx',
          secretAccessKey: 'xxx',
          sessionToken: 'xxx',
        });
      }, 1000);
    }).then((credentials) => {
      const client = new AWS.S3({
        region: AwsS3region,
        // 从后端拿到临时凭证 credentials
        credentials: {
          accessKeyId: credentials.accessKeyId,
          secretAccessKey: credentials.secretAccessKey,
          sessionToken: credentials.sessionToken,
        },
      });

      const params = {
        Bucket: AwsS3Bucket,
        Key: file.fileAwsKey,
        Body: file,
        ACL: 'public-read',
        ContentType: file.type,
      };

      client.putObject(params, (err, data) => {
        onSuccess(file, data);
      });
    });
  };

  const renderUploadButton = () => {
    if (imageUrl) {
      return <img src={imageUrl} alt="avatar" style={{ height: 100, width: 100 }} />;
    }
    if (initlogoUrl) {
      return <img src={initlogoUrl} alt="avatar" style={{ height: 100, width: 100 }} />;
    }

    return (
      <div>
        {uploading ? <LoadingOutlined /> : <PlusOutlined />}
        <p>Drag & Click</p>
      </div>
    );
  };

  return (
    <div style={{ height: 100, width: 100 }}>
      <Dragger
        listType="picture-card"
        showUploadList={false}
        name="logo"
        onChange={handleChange}
        customRequest={handleUplaod}
      >
        {renderUploadButton()}
      </Dragger>
    </div>
  );
};

const getOrgNameByUrl = (url) => {
  if (!url) {
    return null;
  }
  const reg: RegExp = /(https:\/\/|http:\/\/)?github.com\/([^/ ]*)/;
  const result: RegExpExecArray | null = reg.exec(url);
  if (result === null) {
    return null;
  }
  return result[2];
};

enum GithubAppCheckStatus {
  Null,
  Checking,
  UnInstall,
  Installed,
}

export default (): ReactNode => {
  const draftValue = useMemo(() => {
    const value = localStorage.getItem('dao.create.draft');
    if (value) {
      return JSON.parse(value);
    }
    return null;
  }, []);
  const initialValues = draftValue || {};
  const initlogoUrl = initialValues?.logo;
  const initOrgName = getOrgNameByUrl(initialValues?.githubOrg);

  const formRef = useRef<any>(undefined);
  const [orgName, setOrgName] = useState<string | null>(initOrgName);
  const [githubOrgValidateStatus, setGithubOrgValidateStatus] =
    useState<string | undefined>(undefined);
  const [githubOrgHelp, setGithubOrgHelp] = useState<string | undefined>();
  const [submitDisabled, setSubmitDisabled] = useState(true);
  const [appCheckSstatus, setAppCheckSstatus] = useState([orgName, GithubAppCheckStatus.Null]);

  console.log('render', orgName, appCheckSstatus[0], appCheckSstatus[1]);
  const updateSubmitStatus = () => {
    const orgUrl = formRef.current.getFieldValue('githubOrg') || '';
    const logo = formRef.current.getFieldValue('logo') || '';
    const desc = formRef.current.getFieldValue('desc') || '';
    const name = getOrgNameByUrl(orgUrl);

    const bool1 =
      name &&
      name !== '' &&
      appCheckSstatus[0] === name &&
      appCheckSstatus[1] === GithubAppCheckStatus.Installed;
    const bool2 = logo && logo !== '';
    const bool3 = desc && desc.length >= 50;

    if (bool1 && bool2 && bool3) {
      setSubmitDisabled(false);
    } else {
      setSubmitDisabled(true);
    }
  };

  useEffect(() => {
    if (orgName === null) {
      return;
    }
    if (orgName === '') {
      setAppCheckSstatus([null, GithubAppCheckStatus.Null]);
      setSubmitDisabled(true);
      return;
    }

    new Promise<any>((resolve) => {
      setAppCheckSstatus([orgName, GithubAppCheckStatus.Checking]);
      setSubmitDisabled(true);
      setTimeout(() => {
        resolve(true);
      }, 2000);
    }).then((data: any) => {
      console.log(data);
      const orgUrl = formRef.current.getFieldValue('githubOrg');
      const name = getOrgNameByUrl(orgUrl);
      if (name !== orgName) {
        return;
      }
      if (orgName === 'a') {
        setAppCheckSstatus([orgName, GithubAppCheckStatus.Installed]);
      } else {
        setAppCheckSstatus([orgName, GithubAppCheckStatus.UnInstall]);
      }
    });
  }, [orgName]);

  useEffect(() => {
    console.log('appCheckSstatus eff 1');
    if (appCheckSstatus[0] === null) {
      return;
    }
    console.log('appCheckSstatus eff 2');
    updateSubmitStatus();
  }, [appCheckSstatus]);

  useEffect(() => {
    if (initialValues) {
      updateSubmitStatus();
    }
  }, [initialValues]);

  const appStatusNode = (_appCheckSstatus: GithubAppCheckStatus) => {
    if (GithubAppCheckStatus.Checking === _appCheckSstatus) {
      return <div>checking</div>;
    }
    if (GithubAppCheckStatus.UnInstall === _appCheckSstatus) {
      return (
        <Space>
          <a href="//www.baidu.com">INSTALL THE ICPAPP</a>
          <GlobalTooltip
            title="You need to install ICPAPP on GitHub in order to associate with ICPDAO"
            key={'install.tooltip'}
          />
        </Space>
      );
    }
    if (GithubAppCheckStatus.Installed === _appCheckSstatus) {
      return <div>ICPAPP IS INSTALLED</div>;
    }
    return <div></div>;
  };

  const onFinish = (values: any) => {
    console.log(values);
    localStorage.setItem('dao.create.draft', JSON.stringify(values));
  };

  const handleOtherChange = () => {
    updateSubmitStatus();
  };

  const onUploadSuccess = (url: string) => {
    formRef.current.setFieldsValue({ logo: url });
    handleOtherChange();
  };

  const handleGithubOrgChange = () => {
    console.log('handleGithubOrghandleChange');
    const orgUrl = formRef.current.getFieldValue('githubOrg');
    const name = getOrgNameByUrl(orgUrl);
    if (name === null) {
      setGithubOrgValidateStatus('error');
      setGithubOrgHelp('example: https://github.com/orgname');
      setOrgName('');
      return;
    }
    setGithubOrgValidateStatus(undefined);
    setGithubOrgHelp(undefined);
    setOrgName(name);
  };

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <div className={styles.titleBox}>
          <div className={styles.title}>CREATE DAO</div>
          <div className={styles.titleDesc}>We're excited to learn about your organization.</div>
        </div>

        <Form ref={formRef} layout="vertical" initialValues={initialValues} onFinish={onFinish}>
          <Form.Item label="ORGANIZATION LOGO" name="logo">
            <AvatarUpload initlogoUrl={initlogoUrl} onUploadSuccess={onUploadSuccess} />
          </Form.Item>

          <Form.Item
            label="GITHUB ORG"
            name="githubOrg"
            tooltip="tip"
            validateStatus={githubOrgValidateStatus}
            help={githubOrgHelp}
          >
            <Input
              onChange={handleGithubOrgChange}
              placeholder="Please enter the GitHub org address"
            />
          </Form.Item>

          <Form.Item
            label="ORGANIZATION DESCRIPTION"
            name="desc"
            onChange={handleOtherChange}
            rules={[
              {
                min: 50,
              },
            ]}
          >
            <Input.TextArea showCount placeholder="No less than 50 words of project description" />
          </Form.Item>

          <div className={styles.appStatus}>{appStatusNode(appCheckSstatus[1])}</div>

          <Form.Item>
            <Button
              disabled={submitDisabled}
              size="large"
              type="primary"
              htmlType="submit"
              style={{ width: '100%' }}
            >
              CREATE
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};
