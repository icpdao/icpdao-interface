import type { ReactNode } from 'react';
import React, { useCallback, useMemo, useState } from 'react';
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
  Alert,
} from 'antd';
import { FormattedMessage, history, useAccess } from 'umi';
import styles from './index.less';
import GlobalBreadcrumb from '@/components/Breadcrumb';
import { GithubOutlined, HomeOutlined, LoadingOutlined, SettingOutlined } from '@ant-design/icons';
import { useModel } from '@@/plugin-model/useModel';
import type {
  DaoHomeWithLoginQueryQuery,
  DaoHomeWithLoginQueryQueryVariables,
  Maybe,
} from '@/services/dao/generated';
import {
  DaoFollowTypeEnum,
  useDaoHomeWithLoginQueryQuery,
  useDaoHomeWithUnLoginQueryQuery,
  useFollowDaoMutation,
  useUpdateDaoBaseInfoMutation,
} from '@/services/dao/generated';
import { getCurrentTimestamps, getFormatTime, getTimeDistanceHumanize } from '@/utils/utils';
import { useIntl } from '@@/plugin-locale/localeExports';

import DaoIcpperStat from '@/pages/Dao/components/DaoIcpperStat';
import DaoJobStat from '@/pages/Dao/components/DaoJobStat';
import DaoCycle from '@/pages/Dao/components/DaoCycle';
import { uploadS3AssumeRole } from '@/services/icpdao-interface/aws';
import * as AWS from '@aws-sdk/client-s3';
import { ApolloQueryResult } from '@apollo/client/core/types';
import { ApolloError } from '@apollo/client';
import { useMentorWarningModal } from '@/pages/components/MentorWarningModal';
import { getGithubOAuthUrl } from '@/components/RightHeader/AvatarDropdown';

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
  const [showNoVoteAlert, setShowNoVoteAlert] = useState(false);

  if (!initialState) {
    return <PageLoading />;
  }
  const { daoId } = props.match.params;
  const nowAt = getCurrentTimestamps();

  let data: DaoHomeWithLoginQueryQuery | undefined;
  let loading: boolean;
  let error: ApolloError | undefined;
  let refetch: (
    variables?: Partial<DaoHomeWithLoginQueryQueryVariables>,
  ) => Promise<ApolloQueryResult<DaoHomeWithLoginQueryQuery>>;
  if (access.isLogin()) {
    const tmp = useDaoHomeWithLoginQueryQuery({
      variables: { id: daoId, userId: initialState.currentUser()?.profile?.id },
    });
    data = tmp.data;
    loading = tmp.loading;
    error = tmp.error;
    refetch = tmp.refetch;
  } else {
    const tmp = useDaoHomeWithUnLoginQueryQuery({
      variables: { id: daoId },
    });
    data = tmp.data;
    loading = tmp.loading;
    error = tmp.error;
    refetch = tmp.refetch;
  }

  // 正在投票中，距离投票结束最近的一个周期
  const nearVotingCycle = useMemo(() => {
    let result;
    const votingList = data?.dao?.cycles?.nodes?.filter((item) => {
      if (item) {
        return (
          item.datum?.voteBeginAt &&
          item.datum?.voteEndAt &&
          item.datum?.voteBeginAt <= nowAt &&
          item.datum?.voteEndAt > nowAt
        );
      }
      return false;
    });
    votingList?.sort((item1, item2) => {
      return (item1?.datum?.voteEndAt || 0) - (item2?.datum?.voteEndAt || 0);
    });

    if (votingList && votingList.length > 0) {
      // eslint-disable-next-line prefer-destructuring
      result = votingList[0];
    }
    return result;
  }, [data, nowAt]);

  // 正在进行中的，距离 deadline 最近的一个周期
  const processingCycle = useMemo(() => {
    let result;
    const processingCycleList = data?.dao?.cycles?.nodes?.filter((item) => {
      if (item) {
        return (
          item.datum?.beginAt &&
          item.datum?.endAt &&
          item.datum?.beginAt <= nowAt &&
          item.datum?.endAt > nowAt
        );
      }
      return false;
    });
    processingCycleList?.sort((item1, item2) => {
      return (item1?.datum?.endAt || 0) - (item2?.datum?.endAt || 0);
    });

    if (processingCycleList && processingCycleList.length > 0) {
      // eslint-disable-next-line prefer-destructuring
      result = processingCycleList[0];
    }
    return result;
  }, [data, nowAt]);

  // 未完成的，继续投票开始最近的周期
  const nearPreVoteCycle = useMemo(() => {
    let result;
    const preVoteList = data?.dao?.cycles?.nodes?.filter((item) => {
      if (item) {
        return item.datum?.voteBeginAt && item.datum?.voteBeginAt > nowAt;
      }
      return false;
    });
    preVoteList?.sort((item1, item2) => {
      return (item1?.datum?.voteBeginAt || 0) - (item2?.datum?.voteBeginAt || 0);
    });

    if (preVoteList && preVoteList.length > 0) {
      // eslint-disable-next-line prefer-destructuring
      result = preVoteList[0];
    }
    return result;
  }, [data, nowAt]);

  const markJobButtonTipTitle = useMemo(() => {
    if (processingCycle && processingCycle.datum?.endAt) {
      return intl.formatMessage(
        { id: 'pages.dao.home.button.mark.tips' },
        { date_string: getFormatTime(processingCycle?.datum?.endAt, 'LL') },
      );
    }
    return '';
  }, [intl, processingCycle]);

  const goVoteButtonTipTitle = useMemo(() => {
    if (nearVotingCycle && nearVotingCycle.datum?.voteEndAt) {
      return intl.formatMessage(
        { id: 'pages.dao.home.button.vote.tips.time_left' },
        { date_string: getTimeDistanceHumanize(nearVotingCycle.datum?.voteEndAt) },
      );
    }

    if (nearPreVoteCycle && nearPreVoteCycle.datum?.voteBeginAt) {
      return intl.formatMessage(
        { id: 'pages.dao.home.button.vote.tips.time_start' },
        { date_string: getTimeDistanceHumanize(nearPreVoteCycle.datum?.voteBeginAt) },
      );
    }

    return '';
  }, [intl, nearPreVoteCycle, nearVotingCycle]);

  const nearVotingCycleHasVote = useMemo(() => {
    if (nearVotingCycle) {
      const total = nearVotingCycle?.votes?.total || 0;
      return total > 0;
    }
    return false;
  }, [nearVotingCycle]);

  const noVoteAlert = useMemo(() => {
    if (showNoVoteAlert) {
      return (
        <Alert
          message={intl.formatMessage({ id: 'pages.dao.home.alert.no_vote' })}
          type="error"
          showIcon
        />
      );
    }
    return null;
  }, [intl, showNoVoteAlert]);

  const [updateFollowDao] = useFollowDaoMutation();
  const [updateDaoBaseInfo] = useUpdateDaoBaseInfoMutation();

  const dao = data?.dao?.datum || { name: '', desc: '', createAt: 0, logo: '', tokenSymbol: '' };

  let userRole: 'no_login' | 'normal' | 'pre_icpper' | 'icpper' | 'owner' = 'no_login';
  if (access.isDaoOwner(data?.dao?.datum?.ownerId || '')) {
    userRole = 'owner';
  } else if (access.isIcpper()) {
    userRole = 'icpper';
  } else if (access.isPreIcpper()) {
    userRole = 'pre_icpper';
  } else if (access.isNormal()) {
    userRole = 'normal';
  } else if (access.noLogin()) {
    userRole = 'no_login';
  }

  const followBtn = useMemo(() => {
    const follow = data?.dao?.following;
    const followed = follow?.followers?.length && follow?.followers[0]?.createAt;

    if (userRole === 'owner' || userRole === 'no_login') {
      return null;
    }
    if (followed) {
      return (
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
      );
    }

    return (
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
    );
  }, [data, daoId, followedButtonLoading, refetch, updateFollowDao, userRole]);

  const followTotalCount = useMemo(() => {
    return data?.dao?.following?.total || 0;
  }, [data]);

  const { mentorWarningModal, setMentorWarningModalVisible } = useMentorWarningModal(false);

  const defaultActiveKey = 'icpperStat';

  const handleMarkJob = useCallback(() => {
    if (access.noLogin()) {
      const githubOAuth = getGithubOAuthUrl();
      window.open(githubOAuth, '_self');
      return;
    }

    if (access.isNormal()) {
      setMentorWarningModalVisible(true);
      return;
    }

    history.push(`/job?daoId=${daoId}`);
  }, [access, daoId, setMentorWarningModalVisible]);

  const handleGoVote = useCallback(() => {
    if (access.noLogin()) {
      const githubOAuth = getGithubOAuthUrl();
      window.open(githubOAuth, '_self');
      return;
    }

    if (access.isNormal()) {
      setMentorWarningModalVisible(true);
      return;
    }

    if (nearVotingCycleHasVote) {
      history.push(`/dao/${daoId}/${nearVotingCycle?.datum?.id}/vote`);
    } else {
      setShowNoVoteAlert(true);
    }
  }, [access, daoId, nearVotingCycle, nearVotingCycleHasVote, setMentorWarningModalVisible]);

  if (loading || error) {
    return <PageLoading />;
  }

  return (
    <>
      {mentorWarningModal}
      <PageContainer
        ghost
        header={{ breadcrumbRender: () => <GlobalBreadcrumb routes={breadcrumb(daoId)} /> }}
      >
        {noVoteAlert}
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
              {followBtn}
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
            {followTotalCount}
            <FormattedMessage id={`pages.dao.home.following`} />
          </Tag>
        </Space>
        <Divider />
        <Space size={22} className={styles.buttonSpace}>
          <Tooltip placement="right" title={markJobButtonTipTitle}>
            <Button size={'large'} type={'primary'} onClick={handleMarkJob}>
              <FormattedMessage id={`pages.dao.home.button.mark`} />
            </Button>
          </Tooltip>
          <Tooltip placement="right" title={goVoteButtonTipTitle}>
            <Button
              size={'large'}
              type={'primary'}
              danger
              disabled={!nearVotingCycle}
              onClick={handleGoVote}
            >
              <FormattedMessage id={`pages.dao.home.button.vote`} />
            </Button>
          </Tooltip>
        </Space>

        <Tabs defaultActiveKey={defaultActiveKey}>
          <TabPane tab={<FormattedMessage id={'pages.dao.home.tab.icpperStat'} />} key="icpperStat">
            <DaoIcpperStat daoId={daoId} tokenSymbol={data?.dao?.datum?.tokenSymbol || ''} />
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
