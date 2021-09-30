import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

import { Alert, Upload, Form, Input, Button, Space } from 'antd';
import { useIntl, history, useAccess } from 'umi';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';

import * as AWS from '@aws-sdk/client-s3';

import styles from './Create.less';
import GlobalTooltip from '@/components/Tooltip';
import { useDaoGithubAppStatusLazyQuery, useCreateDaoMutation } from '@/services/dao/generated';
import { uploadS3AssumeRole } from '@/services/icpdao-interface/aws';
import { getTimeZone, getTimeZoneOffset } from '@/utils/utils';
import { useModel } from '@@/plugin-model/useModel';
import { PageLoading } from '@ant-design/pro-layout';
import PermissionErrorPage from '@/pages/Result/403';
import IconFont from '@/components/IconFont';

const { Dragger } = Upload;

type onUploadSuccessFunType = (url: string) => void;
interface AvatarUploadProps {
  onUploadSuccess: onUploadSuccessFunType;
  initlogoUrl: string;
}

const getGithubAppInstallUrl = (orgId: any, githubAppName: any) => {
  return `//github.com/apps/${githubAppName}/installations/new/permissions?target_id=${orgId}`;
};

const AvatarUpload: React.FC<AvatarUploadProps> = ({ onUploadSuccess, initlogoUrl }) => {
  const intl = useIntl();
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const fileS3PathPrefix = useMemo(() => {
    return 'avatar';
  }, []);

  const getFileS3Path = useCallback(
    (name) => {
      return `${fileS3PathPrefix}/${name}`;
    },
    [fileS3PathPrefix],
  );

  const handleChange = useCallback(
    (info: any) => {
      const { file } = info;
      if (file.status === 'uploading') {
        setUploading(true);
        return;
      }
      if (file.status === 'done') {
        const { originFileObj } = file;
        const { awsInfo } = originFileObj;
        const fileUrl = `${awsInfo.bucketHost}/${awsInfo.bucket}/${awsInfo.key}`;
        const reader: any = new FileReader();
        reader.addEventListener('load', () => {
          setImageUrl(reader.result);
          setUploading(false);
        });
        reader.readAsDataURL(originFileObj);
        onUploadSuccess(fileUrl);
      }
    },
    [setUploading, setImageUrl, onUploadSuccess],
  );

  const handleCustomRequest = useCallback(
    async (options: any) => {
      const { file, onProgress, onSuccess } = options;

      onProgress(file, 0);

      const { data: credentials }: { success?: boolean; data?: API.AwsSts } =
        await uploadS3AssumeRole();

      if (credentials === undefined) {
        return;
      }

      const client = new AWS.S3({
        region: credentials.region,
        // 从后端拿到临时凭证 credentials
        credentials: {
          accessKeyId: credentials.access_key_id || '',
          secretAccessKey: credentials.secret_access_key || '',
          sessionToken: credentials.session_token || '',
        },
      });

      const params = {
        Bucket: credentials.bucket,
        Key: getFileS3Path(file.uid),
        Body: file,
        ACL: 'public-read',
        ContentType: file.type,
      };

      const data = await client.putObject(params);
      file.awsInfo = {
        key: getFileS3Path(file.uid),
        bucket: credentials.bucket,
        bucketHost: credentials.bucket_host,
        region: credentials.region,
      };
      onSuccess(file, data);
    },
    [getFileS3Path],
  );

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
        <p className={styles.uploadPlaceholder}>
          {intl.formatMessage({ id: 'pages.dao.create.form.item.logo.placeholder' })}
        </p>
      </div>
    );
  }, [imageUrl, initlogoUrl, uploading, intl]);

  return (
    <div className={styles.uploadBox}>
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
  const { initialState } = useModel('@@initialState');
  if (!initialState) {
    return <PageLoading />;
  }

  const intl = useIntl();
  const { isPreIcpperOrIcpper } = useAccess();
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

  const appStatusNode = useMemo(() => {
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
        return null;
      }
      if (
        daoGithubAppStatusResultData.daoGithubAppStatus.isIcpAppInstalled &&
        !daoGithubAppStatusResultData.daoGithubAppStatus.isGithubOrgOwner
      ) {
        return null;
      }
      if (
        daoGithubAppStatusResultData &&
        daoGithubAppStatusResultData.daoGithubAppStatus.githubOrgId === null
      ) {
        return null;
      }
      if (!daoGithubAppStatusResultData.daoGithubAppStatus.isIcpAppInstalled) {
        const orgId = daoGithubAppStatusResultData.daoGithubAppStatus?.githubOrgId;
        const githubAppName = daoGithubAppStatusResultData.daoGithubAppStatus?.githubAppName;
        const url = getGithubAppInstallUrl(orgId, githubAppName);
        const onClick = (evt: any) => {
          evt.preventDefault();
          const values = formRef.current.getFieldsValue();
          localStorage.setItem('dao.create.draft', JSON.stringify(values));
          window.location.href = url;
        };
        return (
          <Space>
            <a onClick={onClick}>
              {intl.formatMessage({
                id: 'pages.dao.create.form.item.app_install_status.un_install.text',
              })}
            </a>
            <GlobalTooltip
              title={intl.formatMessage({
                id: 'pages.dao.create.form.item.app_install_status.un_install.tooltip',
              })}
              key={'install.tooltip'}
            />
          </Space>
        );
      }
      if (
        daoGithubAppStatusResultData.daoGithubAppStatus.isIcpAppInstalled &&
        daoGithubAppStatusResultData.daoGithubAppStatus.isGithubOrgOwner
      ) {
        return (
          <div>
            {intl.formatMessage({ id: 'pages.dao.create.form.item.app_install_status.installed' })}
          </div>
        );
      }
    }
    if (daoGithubAppStatusResultLoading) {
      return (
        <div>
          {intl.formatMessage({ id: 'pages.dao.create.form.item.app_install_status.checking' })}
        </div>
      );
    }
    return null;
  }, [
    daoGithubAppStatusResultVariables,
    daoGithubAppStatusResultData,
    daoGithubAppStatusResultLoading,
    intl,
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
      history.push(`/dao/${data.data?.createDao?.dao?.id}/config?status=create`);
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

  const errorAlert = useMemo(() => {
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
        const error = intl.formatMessage({ id: 'pages.dao.create.form.item.error.dao_is_exists' });
        return (
          <div className={styles.alert}>
            <Alert message={error} type="error" showIcon />
          </div>
        );
      }
      if (
        daoGithubAppStatusResultData.daoGithubAppStatus.isIcpAppInstalled &&
        !daoGithubAppStatusResultData.daoGithubAppStatus.isGithubOrgOwner
      ) {
        const error = intl.formatMessage({ id: 'pages.dao.create.form.item.error.must_is_owner' });
        return (
          <div className={styles.alert}>
            <Alert message={error} type="error" showIcon />
          </div>
        );
      }
      if (
        daoGithubAppStatusResultData &&
        daoGithubAppStatusResultData.daoGithubAppStatus.githubOrgId === null
      ) {
        const error = intl.formatMessage({
          id: 'pages.dao.create.form.item.error.github_org_not_exists',
        });
        return (
          <div className={styles.alert}>
            <Alert message={error} type="error" showIcon />
          </div>
        );
      }
    }
    return null;
  }, [
    daoGithubAppStatusResultData,
    daoGithubAppStatusResultLoading,
    daoGithubAppStatusResultVariables,
    intl,
  ]);

  useEffect(() => {
    updateSubmitStatus();
  }, [updateSubmitStatus]);

  if (!isPreIcpperOrIcpper()) {
    return <PermissionErrorPage />;
  }

  return (
    <div className={styles.container}>
      {errorAlert}

      <div className={styles.box}>
        <div className={styles.titleBox}>
          <div className={styles.title}>
            {intl.formatMessage({ id: 'pages.dao.create.form.title' })}
          </div>
          <div className={styles.titleDesc}>
            {intl.formatMessage({ id: 'pages.dao.create.form.desc' })}
          </div>
        </div>

        <Form ref={formRef} layout="vertical" initialValues={initialValues}>
          <Form.Item
            label={intl.formatMessage({ id: 'pages.dao.create.form.item.logo.title' })}
            name="logo"
          >
            <AvatarUpload initlogoUrl={initlogoUrl} onUploadSuccess={onUploadSuccess} />
          </Form.Item>

          <Form.Item
            label={intl.formatMessage({ id: 'pages.dao.create.form.item.org_url.title' })}
            name="githubOrg"
            tooltip={{
              title: intl.formatMessage({ id: 'pages.dao.create.form.item.org_url.tooltip' }),
              placement: 'right',
              icon: <IconFont type={'icon-question'} />,
            }}
            rules={[
              {
                validator(_, value) {
                  const name: string | null = getOrgNameByUrl(value);
                  if (name === null) {
                    const text = intl.formatMessage({
                      id: 'pages.dao.create.form.item.error.org_url_invalid',
                    });
                    return Promise.reject(new Error(text));
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
            <Input
              placeholder={intl.formatMessage({
                id: 'pages.dao.create.form.item.org_url.placeholder',
              })}
            />
          </Form.Item>

          <Form.Item
            label={intl.formatMessage({ id: 'pages.dao.create.form.item.desc.title' })}
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
              placeholder={intl.formatMessage({
                id: 'pages.dao.create.form.item.desc.placeholder',
              })}
            />
          </Form.Item>

          <div className={styles.appStatus}>{appStatusNode}</div>

          <Form.Item>
            <Button
              loading={createDaoMutationResultLoading}
              disabled={submitDisabled}
              size="large"
              type="primary"
              onClick={onFinish}
              style={{ width: '100%' }}
            >
              {intl.formatMessage({ id: 'pages.dao.create.form.submit' })}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};
