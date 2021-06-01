import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

import { Upload, Form, Input, Button, Space } from 'antd';
import { history } from 'umi';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';

import * as AWS from '@aws-sdk/client-s3';

import styles from './Create.less';
import GlobalTooltip from '@/components/Tooltip';
import { useDaoGithubAppStatusLazyQuery, useCreateDaoMutation } from '@/services/dao/generated';
import { uploadS3AssumeRole } from '@/services/icpdao-interface/aws';
import { getTimeZone, getTimeZoneOffset } from '@/utils/utils';

const { Dragger } = Upload;

type onUploadSuccessFunType = (url: string) => void;
interface AvatarUploadProps {
  onUploadSuccess: onUploadSuccessFunType;
  initlogoUrl: string;
}

const AwsS3Bucket = 'dev.files.icpdao';
const AwsS3region = 'us-east-1';
const AwsS3FileBucketHost = 'https://s3.amazonaws.com';
const GithubAppName = 'icpdao-test';

const getGithubAppInstallUrl = (orgId: any) => {
  return `//github.com/apps/${GithubAppName}/installations/new/permissions?target_id=${orgId}`;
};

const getAwsS3UrlByKey = (key: string) => {
  return `${AwsS3FileBucketHost}/${AwsS3Bucket}/${key}`;
};

const AvatarUpload: React.FC<AvatarUploadProps> = ({ onUploadSuccess, initlogoUrl }) => {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleChange = useCallback(
    (info: any) => {
      const { file } = info;
      if (file.status === 'uploading') {
        setUploading(true);
        return;
      }
      if (file.status === 'done') {
        const reader: any = new FileReader();
        reader.addEventListener('load', () => {
          setImageUrl(reader.result);
          setUploading(false);
        });
        reader.readAsDataURL(file.originFileObj);
        onUploadSuccess(getAwsS3UrlByKey(file.fileAwsKey));
      }
    },
    [setUploading, setImageUrl, onUploadSuccess],
  );

  const handleCustomRequest = useCallback(async (options: any) => {
    const { file, onProgress, onSuccess } = options;

    file.fileAwsKey = `avatar/${file.uid}`;
    onProgress(file, 0);

    const { data: credentials }: { success?: boolean; data?: API.AwsSts } =
      await uploadS3AssumeRole();

    if (credentials === undefined) {
      return;
    }

    const client = new AWS.S3({
      region: AwsS3region,
      // 从后端拿到临时凭证 credentials
      credentials: {
        accessKeyId: credentials.access_key_id || '',
        secretAccessKey: credentials.secret_access_key || '',
        sessionToken: credentials.session_token || '',
      },
    });

    const params = {
      Bucket: AwsS3Bucket,
      Key: file.fileAwsKey,
      Body: file,
      ACL: 'public-read',
      ContentType: file.type,
    };

    const data = await client.putObject(params);
    onSuccess(file, data);
  }, []);

  const renderUploadButton = useCallback(() => {
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
  }, [imageUrl, initlogoUrl, uploading]);

  return (
    <div style={{ height: 100, width: 100 }}>
      <Dragger
        listType="picture-card"
        showUploadList={false}
        name="logo"
        onChange={handleChange}
        customRequest={handleCustomRequest}
      >
        {renderUploadButton()}
      </Dragger>
    </div>
  );
};

const getOrgNameByUrl = (url: string) => {
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

export default (): React.ReactNode => {
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
  const [submitDisabled, setSubmitDisabled] = useState(true);

  const [queryDaoGithubAppStatus, daoGithubAppStatusResult] = useDaoGithubAppStatusLazyQuery({
    fetchPolicy: 'no-cache',
  });
  const daoGithubAppStatusResultLoading = daoGithubAppStatusResult?.loading;
  const daoGithubAppStatusResultData = daoGithubAppStatusResult?.data;
  const daoGithubAppStatusResultVariables = daoGithubAppStatusResult.variables;

  const [createDaoMutation, createDaoMutationResult] = useCreateDaoMutation();
  const createDaoMutationResultLoading = createDaoMutationResult.loading;

  const appStatusNode = useCallback(() => {
    const orgUrl = formRef.current?.getFieldValue('githubOrg') || '';
    const name = getOrgNameByUrl(orgUrl);
    const checkName = daoGithubAppStatusResultVariables?.name;
    if (
      !daoGithubAppStatusResultLoading &&
      daoGithubAppStatusResultData?.daoGithubAppStatus &&
      name &&
      name === checkName
    ) {
      if (daoGithubAppStatusResultData.daoGithubAppStatus.isExists) {
        return <div>Dao is exists</div>;
      }
      if (
        daoGithubAppStatusResultData.daoGithubAppStatus.isIcpAppInstalled &&
        !daoGithubAppStatusResultData.daoGithubAppStatus.isGithubOrgOwner
      ) {
        return <div>your must is github org owner</div>;
      }
      if (
        daoGithubAppStatusResultData &&
        daoGithubAppStatusResultData.daoGithubAppStatus.githubOrgId === null
      ) {
        return <div>github org not exists</div>;
      }
      if (!daoGithubAppStatusResultData.daoGithubAppStatus.isIcpAppInstalled) {
        const orgId = daoGithubAppStatusResultData.daoGithubAppStatus?.githubOrgId;
        const url = getGithubAppInstallUrl(orgId);
        const onClick = (evt: any) => {
          evt.preventDefault();
          const values = formRef.current.getFieldsValue();
          localStorage.setItem('dao.create.draft', JSON.stringify(values));
          window.location.href = url;
        };
        return (
          <Space>
            <a onClick={onClick}>INSTALL THE ICPAPP</a>
            <GlobalTooltip
              title="You need to install ICPAPP on GitHub in order to associate with ICPDAO"
              key={'install.tooltip'}
            />
          </Space>
        );
      }
      if (
        daoGithubAppStatusResultData.daoGithubAppStatus.isIcpAppInstalled &&
        daoGithubAppStatusResultData.daoGithubAppStatus.isGithubOrgOwner
      ) {
        return <div>ICPAPP IS INSTALLED</div>;
      }
    }
    if (daoGithubAppStatusResultLoading) {
      return <div>checking</div>;
    }
    return <div></div>;
  }, [
    daoGithubAppStatusResultVariables,
    daoGithubAppStatusResultData,
    daoGithubAppStatusResultLoading,
  ]);

  const updateSubmitStatus = useCallback(() => {
    if (daoGithubAppStatusResultLoading) {
      setSubmitDisabled(true);
      return;
    }
    const orgUrl = formRef.current.getFieldValue('githubOrg') || '';
    const logo = formRef.current.getFieldValue('logo') || '';
    const desc = formRef.current.getFieldValue('desc') || '';
    const name = getOrgNameByUrl(orgUrl);

    const bool1 =
      name &&
      name !== '' &&
      daoGithubAppStatusResultVariables &&
      name === daoGithubAppStatusResultVariables.name &&
      daoGithubAppStatusResultData &&
      daoGithubAppStatusResultData.daoGithubAppStatus &&
      daoGithubAppStatusResultData?.daoGithubAppStatus.isIcpAppInstalled &&
      daoGithubAppStatusResultData?.daoGithubAppStatus.isGithubOrgOwner &&
      !daoGithubAppStatusResultData?.daoGithubAppStatus.isExists;

    const bool2 = logo && logo !== '';
    const bool3 = desc && desc.length >= 50;

    if (bool1 && bool2 && bool3) {
      setSubmitDisabled(false);
    } else {
      setSubmitDisabled(true);
    }
  }, [
    daoGithubAppStatusResultVariables,
    daoGithubAppStatusResultData,
    daoGithubAppStatusResultLoading,
  ]);

  const handleDescChange = useCallback(() => {
    updateSubmitStatus();
  }, [updateSubmitStatus]);

  const onUploadSuccess = useCallback(
    (url: string) => {
      formRef.current.setFieldsValue({ logo: url });
      updateSubmitStatus();
    },
    [updateSubmitStatus],
  );

  const onFinish = useCallback(async () => {
    localStorage.removeItem('dao.create.draft');

    const githubOrg = formRef.current.getFieldValue('githubOrg') || '';
    const logo = formRef.current.getFieldValue('logo') || '';
    const desc = formRef.current.getFieldValue('desc') || '';
    const name: any = getOrgNameByUrl(githubOrg);

    const data = await createDaoMutation({
      variables: {
        name,
        desc,
        logo,
        timeZone: getTimeZoneOffset(),
        timeZoneRegion: getTimeZone(),
      },
    });
    if (!data.errors) {
      history.push(`/dao/${data.data?.createDao?.dao?.id}/config?status=job`);
    }
  }, [createDaoMutation]);

  useEffect(() => {
    if (initOrgName) {
      queryDaoGithubAppStatus({
        variables: {
          name: initOrgName,
        },
      });
    }
  }, [initOrgName, queryDaoGithubAppStatus]);

  useEffect(() => {
    updateSubmitStatus();
  }, [updateSubmitStatus]);

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <div className={styles.titleBox}>
          <div className={styles.title}>CREATE DAO</div>
          <div className={styles.titleDesc}>We're excited to learn about your organization.</div>
        </div>

        <Form ref={formRef} layout="vertical" initialValues={initialValues}>
          <Form.Item label="ORGANIZATION LOGO" name="logo">
            <AvatarUpload initlogoUrl={initlogoUrl} onUploadSuccess={onUploadSuccess} />
          </Form.Item>

          <Form.Item
            label="GITHUB ORG"
            name="githubOrg"
            tooltip="tip"
            rules={[
              {
                validator(_, value) {
                  const name: string | null = getOrgNameByUrl(value);
                  if (name === null) {
                    return Promise.reject(new Error('example: https://github.com/orgnam'));
                  }
                  if (name !== '') {
                    setSubmitDisabled(true);
                    queryDaoGithubAppStatus({
                      variables: {
                        name,
                      },
                    });
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="Please enter the GitHub org address" />
          </Form.Item>

          <Form.Item
            label="ORGANIZATION DESCRIPTION"
            name="desc"
            rules={[
              {
                min: 50,
              },
            ]}
          >
            <Input.TextArea
              showCount
              onChange={handleDescChange}
              placeholder="No less than 50 words of project description"
            />
          </Form.Item>

          <div className={styles.appStatus}>{appStatusNode()}</div>

          <Form.Item>
            <Button
              loading={createDaoMutationResultLoading}
              disabled={submitDisabled}
              size="large"
              type="primary"
              onClick={onFinish}
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
