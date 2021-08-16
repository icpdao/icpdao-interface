import type { ReactNode } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { PageContainer, PageLoading } from '@ant-design/pro-layout';
import {
  Upload,
  Avatar,
  Button,
  Col,
  Row,
  Space,
  Typography,
  Tag,
  Divider,
  message,
  Tabs,
  Tooltip,
} from 'antd';
import { FormattedMessage, history, useAccess } from 'umi';
import styles from './index.less';
import GlobalBreadcrumb from '@/components/Breadcrumb';
import { GithubOutlined, HomeOutlined, LoadingOutlined, SettingOutlined } from '@ant-design/icons';
import { useModel } from '@@/plugin-model/useModel';
import type { CycleSchema, Maybe } from '@/services/dao/generated';
import {
  DaoFollowTypeEnum,
  useDaoFollowInfoQuery,
  useDaoProcessingCycleQuery,
  useDaoVotingCycleQuery,
  useFollowDaoMutation,
  useUpdateDaoBaseInfoMutation,
} from '@/services/dao/generated';
import { getFormatTime, getTimeDistanceHumanize } from '@/utils/utils';
import { useIntl } from '@@/plugin-locale/localeExports';

import DaoIcpperStat from '@/pages/Dao/components/DaoIcpperStat';
import DaoJobStat from '@/pages/Dao/components/DaoJobStat';
import DaoCycle from '@/pages/Dao/components/DaoCycle';
import { uploadS3AssumeRole } from '@/services/icpdao-interface/aws';
import * as AWS from '@aws-sdk/client-s3';

const { TabPane } = Tabs;

const { Paragraph } = Typography;
const { Dragger } = Upload;

type setUploadingFunType = (uploading: boolean) => void;
type onUploadSuccessFunType = (url: string, setUploading: setUploadingFunType) => void;
type DaoAvatarProps = {
  daoName: string;
  daologo: Maybe<string> | undefined;
  onUploadSuccess: onUploadSuccessFunType;
};

const DaoAvatar: React.FC<DaoAvatarProps> = ({ daoName, daologo, onUploadSuccess }) => {
  const intl = useIntl();
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(daologo);

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
        });
        reader.readAsDataURL(originFileObj);
        onUploadSuccess(fileUrl, setUploading);
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
    if (!uploading && imageUrl) {
      return (
        <Avatar size={106} alt="avatar" src={imageUrl}>
          {daoName}
        </Avatar>
      );
    }
    return (
      <div>
        <LoadingOutlined />
        <p>{intl.formatMessage({ id: 'pages.dao.home.logo.upload_desc' })}</p>
      </div>
    );
  }, [imageUrl, uploading, intl, daoName]);

  return (
    <div style={{ height: 100, width: 100 }}>
      <Dragger
        className={styles.avatarUpload}
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

const breadcrumb = (daoId: string) => [
  {
    icon: <HomeOutlined />,
    path: '',
    breadcrumbName: 'HOME',
    menuId: 'home',
  },
  {
    path: '/dao/explore',
    breadcrumbName: 'EXPLORE DAO',
    menuId: 'dao.explore',
  },
  {
    path: `/dao/${daoId}`,
    breadcrumbName: 'HOMEPAGE',
    menuId: 'dao.home',
  },
];

export default (props: { match: { params: { daoId: string } } }): ReactNode => {
  const { initialState } = useModel('@@initialState');
  const access = useAccess();
  const intl = useIntl();
  const [followedButtonLoading, setFollowedButtonLoading] = useState(false);
  const [votingCycle, setVotingCycle] = useState<CycleSchema>();
  const [processingCycle, setProcessingCycle] = useState<CycleSchema>();
  if (!initialState) {
    return <PageLoading />;
  }
  const { daoId } = props.match.params;

  const { data, loading, error, refetch } = useDaoFollowInfoQuery({
    variables: { id: daoId, userId: initialState.currentUser()?.profile?.id },
  });
  const { data: votingCycleData } = useDaoVotingCycleQuery({ variables: { daoId } });
  const { data: processingCycleData } = useDaoProcessingCycleQuery({ variables: { daoId } });
  const [updateFollowDao] = useFollowDaoMutation();
  const [updateDaoBaseInfo] = useUpdateDaoBaseInfoMutation();
  useEffect(() => {
    votingCycleData?.dao?.cycles?.nodes?.forEach((v) => {
      setVotingCycle(v?.datum as CycleSchema);
    });
    processingCycleData?.dao?.cycles?.nodes?.forEach((v) => {
      setProcessingCycle(v?.datum as CycleSchema);
    });
  }, [votingCycleData, processingCycleData]);

  if (loading || error) {
    return <PageLoading />;
  }
  const dao = data?.dao?.datum || { name: '', desc: '', createAt: 0, logo: '' };

  const follow = data?.dao?.following;
  const followed = follow?.followers?.length && follow?.followers[0]?.createAt;

  let userRole: 'normal' | 'icpper' | 'owner' = 'normal';
  if (access.isDaoOwner(data?.dao?.datum?.ownerId || '')) {
    userRole = 'owner';
  } else if (access.isIcpper()) {
    userRole = 'icpper';
  }
  const defaultActiveKey = 'icpperStat';

  return (
    <>
      <PageContainer
        ghost
        header={{ breadcrumbRender: () => <GlobalBreadcrumb routes={breadcrumb(daoId)} /> }}
      >
        <Row className={styles.headerRow}>
          <Col span={12}>
            <Space size={30} className={styles.headerSpace}>
              {userRole === 'owner' && (
                <DaoAvatar
                  daoName={dao.name}
                  daologo={dao.logo}
                  onUploadSuccess={async (newLogo, setUploading) => {
                    await updateDaoBaseInfo({
                      variables: { id: daoId, logo: newLogo },
                    });
                    await refetch();
                    setUploading(false);
                    message.success(intl.formatMessage({ id: 'pages.dao.home.logo.success' }));
                  }}
                />
              )}
              {userRole !== 'owner' && (
                <Avatar size={106} alt={dao.name} src={dao.logo}>
                  {dao.name}
                </Avatar>
              )}
              <span className={styles.headerTitle}>{dao.name}</span>
            </Space>
          </Col>
          <Col span={12} className={styles.headerCol}>
            <Space size={10} className={styles.headerSpaceRight}>
              <Button
                href={`https://github.com/${dao.name}`}
                target={'_blank'}
                icon={<GithubOutlined style={{ paddingRight: 5 }} />}
              >
                <FormattedMessage id={`pages.dao.home.view`} />
              </Button>
              {userRole === 'owner' && (
                <Button
                  style={{ width: 40 }}
                  onClick={() => history.push(`/dao/${daoId}/config`)}
                  icon={<SettingOutlined style={{ fontSize: 17 }} />}
                />
              )}
              {userRole !== 'owner' && followed && (
                <Button
                  onClick={async () => {
                    setFollowedButtonLoading(true);
                    await updateFollowDao({
                      variables: { daoId, followType: DaoFollowTypeEnum.Delete },
                    });
                    await refetch();
                    setFollowedButtonLoading(false);
                  }}
                  loading={followedButtonLoading}
                >
                  <FormattedMessage id={`pages.dao.home.unfollowed`} />
                </Button>
              )}
              {userRole !== 'owner' && !followed && (
                <Button
                  onClick={async () => {
                    setFollowedButtonLoading(true);
                    await updateFollowDao({
                      variables: { daoId, followType: DaoFollowTypeEnum.Add },
                    });
                    await refetch();
                    setFollowedButtonLoading(false);
                  }}
                  loading={followedButtonLoading}
                >
                  <FormattedMessage id={`pages.dao.home.followed`} />
                </Button>
              )}
            </Space>
          </Col>
        </Row>
        <Paragraph
          editable={
            userRole === 'owner'
              ? {
                  onChange: async (value) => {
                    if (value.length < 50) {
                      message.error(intl.formatMessage({ id: 'pages.dao.home.desc.error' }));
                      return;
                    }
                    await updateDaoBaseInfo({
                      variables: { id: daoId, desc: value },
                    });
                    await refetch();
                    message.success(intl.formatMessage({ id: 'pages.dao.home.desc.success' }));
                  },
                  autoSize: { minRows: 3 },
                  tooltip: false,
                }
              : false
          }
        >
          {dao.desc}
        </Paragraph>
        <Space size={10} className={styles.tagSpace}>
          <Tag color="processing">
            {getFormatTime(dao.createAt, 'LL')}
            <FormattedMessage id={`pages.dao.home.created`} />
          </Tag>
          <Tag color="success">
            {follow?.total || 0}
            <FormattedMessage id={`pages.dao.home.following`} />
          </Tag>
        </Space>
        <Divider />
        <Space size={22} className={styles.buttonSpace}>
          <Tooltip
            placement="right"
            title={
              processingCycle?.endAt
                ? intl.formatMessage(
                    { id: 'pages.dao.home.button.mark.tips' },
                    { date_string: getFormatTime(processingCycle.endAt, 'LL') },
                  )
                : ''
            }
          >
            <Button
              size={'large'}
              type={'primary'}
              onClick={() => history.push(`/job?daoId=${daoId}`)}
            >
              <FormattedMessage id={`pages.dao.home.button.mark`} />
            </Button>
          </Tooltip>
          <Tooltip
            placement="right"
            title={
              votingCycle?.endAt
                ? intl.formatMessage(
                    { id: 'pages.dao.home.button.vote.tips' },
                    { date_string: getTimeDistanceHumanize(votingCycle.endAt) },
                  )
                : ''
            }
          >
            <Button
              size={'large'}
              type={'primary'}
              danger
              disabled={!votingCycle}
              onClick={() => history.push(`/dao/${daoId}/${votingCycle?.id}/vote`)}
            >
              <FormattedMessage id={`pages.dao.home.button.vote`} />
            </Button>
          </Tooltip>
        </Space>

        <Tabs defaultActiveKey={defaultActiveKey}>
          <TabPane tab={<FormattedMessage id={'pages.dao.home.tab.icpperStat'} />} key="icpperStat">
            <DaoIcpperStat daoId={daoId} />
          </TabPane>

          <TabPane tab={<FormattedMessage id={'pages.dao.home.tab.jobStat'} />} key="jobStat">
            <DaoJobStat daoId={daoId} />
          </TabPane>

          <TabPane tab={<FormattedMessage id={'pages.dao.home.tab.cycle'} />} key="cycle">
            <DaoCycle daoId={daoId} userRole={userRole} />
          </TabPane>
        </Tabs>
      </PageContainer>
    </>
  );
};
