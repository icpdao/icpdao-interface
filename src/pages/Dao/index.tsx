import type { ReactNode } from 'react';
import { useState } from 'react';
import { PageContainer, PageLoading } from '@ant-design/pro-layout';
import { Avatar, Button, Col, Row, Space, Tabs, Typography, Tag, Divider, message } from 'antd';
import { FormattedMessage, history, useAccess } from 'umi';
import styles from './index.less';
import GlobalBreadcrumb from '@/components/Breadcrumb';
import { GithubOutlined, HomeOutlined, SettingOutlined } from '@ant-design/icons';
import { useModel } from '@@/plugin-model/useModel';
import {
  DaoFollowTypeEnum,
  useDaoFollowInfoQuery,
  useFollowDaoMutation,
  useUpdateDaoBaseInfoMutation,
} from '@/services/dao/generated';
import { getFormatTime } from '@/utils/utils';
import { useIntl } from '@@/plugin-locale/localeExports';

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

const configTab = (
  <>
    <TabPane tab={<FormattedMessage id={`pages.dao.home.tab.icpper`} />} key="icpper" />
    <TabPane tab={<FormattedMessage id={`pages.dao.home.tab.job`} />} key="job" />
    <TabPane tab={<FormattedMessage id={`pages.dao.home.tab.cycle`} />} key="cycle" />
  </>
);

export default (props: { match: { params: { daoId: string } } }): ReactNode => {
  const { initialState } = useModel('@@initialState');
  const access = useAccess();
  const intl = useIntl();
  const [tab, setTab] = useState<string>('icpper');
  const [followedButtonLoading, setFollowedButtonLoading] = useState(false);
  if (!initialState) {
    return <PageLoading />;
  }
  const { daoId } = props.match.params;

  const { data, loading, error, refetch } = useDaoFollowInfoQuery({
    variables: { id: daoId, userId: initialState.currentUser()?.profile?.id },
  });
  const [updateFollowDao] = useFollowDaoMutation();
  const [updateDaoBaseInfo] = useUpdateDaoBaseInfoMutation();

  if (loading || error) {
    return <PageLoading />;
  }
  const dao = data?.dao?.datum || { name: '', desc: '', createAt: 0, logo: '' };

  const follow = data?.dao?.following;
  const followed = follow?.followers?.length && follow?.followers[0]?.createAt;

  const isOnwer = access.isDaoOwner(data?.dao?.datum?.ownerId || '');

  return (
    <>
      <PageContainer
        ghost
        header={{ breadcrumbRender: () => <GlobalBreadcrumb routes={breadcrumb(daoId)} /> }}
      >
        <Row className={styles.headerRow}>
          <Col span={6}>
            <Space size={30} className={styles.headerSpace}>
              <Avatar size={106} alt={dao.name} src={dao.logo}>
                {dao.name}
              </Avatar>
              <span className={styles.headerTitle}>{dao.name}</span>
            </Space>
          </Col>
          <Col span={6} offset={12} className={styles.headerCol}>
            <Space size={10} className={styles.headerSpaceRight}>
              <Button
                href={`https://github.com/${dao.name}`}
                target={'_blank'}
                icon={<GithubOutlined style={{ paddingRight: 5 }} />}
              >
                <FormattedMessage id={`pages.dao.home.view`} />
              </Button>
              {isOnwer && (
                <Button
                  style={{ width: 40 }}
                  onClick={() => history.push(`/dao/${daoId}/config`)}
                  icon={<SettingOutlined style={{ fontSize: 17 }} />}
                ></Button>
              )}
              {!isOnwer && followed && (
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
              {!isOnwer && !followed && (
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
            isOnwer
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
          <Button size={'large'} type={'primary'}>
            <FormattedMessage id={`pages.dao.home.button.mark`} />
          </Button>
          <Button size={'large'} type={'primary'}>
            <FormattedMessage id={`pages.dao.home.button.vote`} />
          </Button>
        </Space>
        <Tabs defaultActiveKey={tab} onChange={setTab}>
          {configTab}
        </Tabs>
      </PageContainer>
    </>
  );
};
