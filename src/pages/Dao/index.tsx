import type { ReactNode } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { PageContainer, PageLoading } from '@ant-design/pro-layout';
import {
  Avatar,
  Button,
  Col,
  Divider,
  message,
  Row,
  Space,
  Tabs,
  Tag,
  Typography,
  Upload,
  Tooltip,
} from 'antd';
import { FormattedMessage, history, useAccess } from 'umi';
import styles from './index.less';
import GlobalBreadcrumb from '@/components/Breadcrumb';
import {
  GithubOutlined,
  HomeOutlined,
  LoadingOutlined,
  SecurityScanFilled,
  SettingOutlined,
} from '@ant-design/icons';
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
  useDaoTokenConfigQuery,
  useFollowDaoMutation,
  useUpdateDaoBaseInfoMutation,
} from '@/services/dao/generated';
import { getFormatTime } from '@/utils/utils';
import { useIntl } from '@@/plugin-locale/localeExports';

import DaoIcpperStat from '@/pages/Dao/components/DaoIcpperStat';
import DaoJobStat from '@/pages/Dao/components/DaoJobStat';
import DaoCycle from '@/pages/Dao/components/DaoCycle';
import { uploadS3AssumeRole } from '@/services/icpdao-interface/aws';
import * as AWS from '@aws-sdk/client-s3';
import type { ApolloQueryResult } from '@apollo/client/core/types';
import type { ApolloError } from '@apollo/client';
import { getGithubOAuthUrl } from '@/components/RightHeader/AvatarDropdown';
import DaoStepStatus from '@/pages/Dao/components/DaoStepStatus';
import type { Token } from '@/services/subgraph-v1/generated';
import { useSubgraphV1ExistedTokenInfoLazyQuery } from '@/services/subgraph-v1/generated';
import { ZeroAddress } from '@/services/ethereum-connect';
import { descToken } from '@/utils/pageHelper';

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
  const { daoId } = props.match.params;
  const [followedButtonLoading, setFollowedButtonLoading] = useState(false);
  // const [showNoVoteAlert, setShowNoVoteAlert] = useState(false);

  if (!initialState) {
    return <PageLoading />;
  }

  const { chainId, isConnected } = useModel('useWalletModel');
  const queryChainId = useMemo(() => {
    if (isConnected) {
      return chainId?.toString() || ICPDAO_MINT_TOKEN_ETH_CHAIN_ID;
    }
    return ICPDAO_MINT_TOKEN_ETH_CHAIN_ID;
  }, [chainId, isConnected]);

  let data: DaoHomeWithLoginQueryQuery | undefined;
  let loading: boolean;
  let error: ApolloError | undefined;
  let refetch: (
    variables?: Partial<DaoHomeWithLoginQueryQueryVariables>,
  ) => Promise<ApolloQueryResult<DaoHomeWithLoginQueryQuery>>;
  if (access.isLogin()) {
    const tmp = useDaoHomeWithLoginQueryQuery({
      variables: {
        id: daoId,
        userId: initialState.currentUser()?.profile?.id,
        tokenChainId: queryChainId,
      },
    });
    data = tmp.data;
    loading = tmp.loading;
    error = tmp.error;
    refetch = tmp.refetch;
  } else {
    const tmp = useDaoHomeWithUnLoginQueryQuery({
      variables: { id: daoId, tokenChainId: queryChainId },
    });
    data = tmp.data;
    loading = tmp.loading;
    error = tmp.error;
    refetch = tmp.refetch;
  }
  const [queryExistedToken, existedTokenResult] = useSubgraphV1ExistedTokenInfoLazyQuery({
    fetchPolicy: 'no-cache',
  });

  const { data: daoTokenConfigData } = useDaoTokenConfigQuery({ variables: { daoId } });
  const { contract } = useModel('useWalletModel');
  useEffect(() => {
    if (!data?.dao?.datum || !daoTokenConfigData?.daoTokenConfig?.ethDaoId) return;
    contract.daoFactory
      .getTokenAddress(daoTokenConfigData?.daoTokenConfig?.ethDaoId)
      .then((v: any) => {
        if (v.token !== ZeroAddress)
          queryExistedToken({ variables: { tokenId: v.token.toLowerCase() } });
      });
  }, [
    contract.daoFactory,
    daoTokenConfigData?.daoTokenConfig?.ethDaoId,
    data?.dao?.datum,
    queryExistedToken,
  ]);

  const tokenBadge = useMemo(() => {
    if (!existedTokenResult.loading && !existedTokenResult.data?.token) return <></>;
    if (existedTokenResult.loading || !existedTokenResult.data?.token) return <LoadingOutlined />;
    const desc = descToken(existedTokenResult.data.token as Token);
    if (desc.length === 0)
      return (
        <div>
          <SecurityScanFilled
            style={{ fontSize: '24px', color: '#F2C94C', verticalAlign: 'center' }}
          />
        </div>
      );
    return (
      <Tooltip placement="right" title={desc} overlayStyle={{ maxWidth: '29.875rem' }}>
        <div>
          <SecurityScanFilled
            style={{ fontSize: '24px', color: '#F2C94C', verticalAlign: 'center' }}
          />
        </div>
      </Tooltip>
    );
  }, [existedTokenResult?.data?.token, existedTokenResult.loading]);

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

    if (userRole === 'owner') {
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
          if (userRole === 'no_login') {
            const githubOAuth = getGithubOAuthUrl();
            window.open(githubOAuth, '_self');
            return;
          }
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

  const defaultActiveKey = 'icpperStat';

  if (loading || error) {
    return <PageLoading />;
  }

  return (
    <>
      <PageContainer
        ghost
        header={{ breadcrumbRender: () => <GlobalBreadcrumb routes={breadcrumb(daoId)} /> }}
      >
        {/*  {noVoteAlert}  */}
        <Row className={styles.headerRow}>
          <Col xs={24} sm={12}>
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
              {tokenBadge}
            </Space>
          </Col>
          <Col xs={24} sm={12} className={styles.headerCol}>
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
        {/*  <Space size={22} className={styles.buttonSpace}>  */}
        {/*    <Tooltip placement="right" title={markJobButtonTipTitle}>  */}
        {/*      <AccessButton  */}
        {/*        allow={AccessEnum.PREICPPER}  */}
        {/*        size={'large'}  */}
        {/*        type={'primary'}  */}
        {/*        onClick={handleMarkJob}  */}
        {/*      >  */}
        {/*        <FormattedMessage id={`pages.dao.home.button.mark`} />  */}
        {/*      </AccessButton>  */}
        {/*    </Tooltip>  */}
        {/*    <Tooltip placement="right" title={goVoteButtonTipTitle}>  */}
        {/*      <AccessButton  */}
        {/*        allow={AccessEnum.PREICPPER}  */}
        {/*        size={'large'}  */}
        {/*        type={'primary'}  */}
        {/*        danger  */}
        {/*        disabled={!nearVotingCycle}  */}
        {/*        onClick={handleGoVote}  */}
        {/*      >  */}
        {/*        <FormattedMessage id={`pages.dao.home.button.vote`} />  */}
        {/*      </AccessButton>  */}
        {/*    </Tooltip>  */}
        {/*  </Space>  */}

        <DaoStepStatus daoId={daoId} isOwner={userRole === 'owner'} />
        <Divider />
        <Tabs defaultActiveKey={defaultActiveKey}>
          <TabPane tab={<FormattedMessage id={'pages.dao.home.tab.icpperStat'} />} key="icpperStat">
            <DaoIcpperStat daoId={daoId} />
          </TabPane>

          <TabPane tab={<FormattedMessage id={'pages.dao.home.tab.jobStat'} />} key="jobStat">
            <DaoJobStat daoId={daoId} />
          </TabPane>

          <TabPane tab={<FormattedMessage id={'pages.dao.home.tab.cycle'} />} key="cycle">
            <DaoCycle
              daoId={daoId}
              userRole={userRole}
              tokenSymbol={data?.dao?.tokenInfo?.tokenSymbol || ''}
            />
          </TabPane>
        </Tabs>
      </PageContainer>
    </>
  );
};
