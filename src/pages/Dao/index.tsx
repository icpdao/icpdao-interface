import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { PageContainer, PageLoading } from '@ant-design/pro-layout';
import { Avatar, Button, Col, Row, Space, Typography, Tag, Divider, message, Tabs } from 'antd';
import { FormattedMessage, history, useAccess } from 'umi';
import styles from './index.less';
import GlobalBreadcrumb from '@/components/Breadcrumb';
import { GithubOutlined, HomeOutlined, SettingOutlined } from '@ant-design/icons';
import { useModel } from '@@/plugin-model/useModel';
import type { CycleSchema } from '@/services/dao/generated';
import {
  DaoFollowTypeEnum,
  useDaoFollowInfoQuery,
  useDaoVotingCycleQuery,
  useFollowDaoMutation,
  useUpdateDaoBaseInfoMutation,
} from '@/services/dao/generated';
import { getFormatTime } from '@/utils/utils';
import { useIntl } from '@@/plugin-locale/localeExports';

import DaoIcpperStat from '@/pages/Dao/components/DaoIcpperStat';
import DaoJobStat from '@/pages/Dao/components/DaoJobStat';
import DaoCycle from '@/pages/Dao/components/DaoCycle';

const { TabPane } = Tabs;

const { Paragraph } = Typography;

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
  if (!initialState) {
    return <PageLoading />;
  }
  const { daoId } = props.match.params;

  const { data, loading, error, refetch } = useDaoFollowInfoQuery({
    variables: { id: daoId, userId: initialState.currentUser()?.profile?.id },
  });
  const { data: votingCycleData } = useDaoVotingCycleQuery({ variables: { daoId } });
  const [updateFollowDao] = useFollowDaoMutation();
  const [updateDaoBaseInfo] = useUpdateDaoBaseInfoMutation();
  useEffect(() => {
    votingCycleData?.dao?.cycles?.nodes?.forEach((v) => {
      setVotingCycle(v?.datum as CycleSchema);
    });
  }, [votingCycleData]);

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
              <Avatar size={106} alt={dao.name} src={dao.logo}>
                {dao.name}
              </Avatar>
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
          <Button
            size={'large'}
            type={'primary'}
            onClick={() => history.push(`/job?daoId=${daoId}`)}
          >
            <FormattedMessage id={`pages.dao.home.button.mark`} />
          </Button>
          <Button
            size={'large'}
            type={'primary'}
            danger
            disabled={!votingCycle}
            onClick={() => history.push(`/dao/${daoId}/${votingCycle?.id}/vote`)}
          >
            <FormattedMessage id={`pages.dao.home.button.vote`} />
          </Button>
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
