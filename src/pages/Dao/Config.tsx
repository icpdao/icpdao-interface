import type { ReactNode } from 'react';
import { PageContainer, PageLoading } from '@ant-design/pro-layout';
import { Tabs, Button } from 'antd';
import { FormattedMessage, useAccess, history } from 'umi';
import styles from './index.less';
import GlobalBreadcrumb from '@/components/Breadcrumb';
import { HomeOutlined } from '@ant-design/icons';
import { useDaoQuery } from '@/services/dao/generated';
import PermissionErrorPage from '@/pages/Result/403';
import { useCallback, useMemo, useState } from 'react';
import DAOJobConfig from '@/pages/Dao/components/JobConfig';
import TokenConfig from '@/pages/Dao/components/TokenConfig';

const { TabPane } = Tabs;
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
  {
    path: `/dao/${daoId}/config`,
    breadcrumbName: 'CONFIG',
    menuId: 'dao.config',
  },
];

const configTab = (
  <>
    <TabPane tab={<FormattedMessage id={`pages.dao.config.tab.job`} />} key="job" />
    <TabPane tab={<FormattedMessage id={`pages.dao.config.tab.token`} />} key="token" />
  </>
);

const firstConfigStep = ['job', 'token'];

export default (props: {
  match: { params: { daoId: string; configType?: string; subType?: string } };
  location: { query: { status?: string } };
}): ReactNode => {
  const { isDaoOwner } = useAccess();
  const { daoId, configType, subType } = props.match.params;
  const { status } = props.location.query;
  const [tab, setTab] = useState<string>(configType || 'job');

  const goTab = useCallback(
    (nextTab) => {
      history.push(`/dao/${daoId}/config/${nextTab}`);
      setTab(nextTab);
    },
    [daoId],
  );

  const { data, loading, error } = useDaoQuery({
    variables: { id: daoId },
  });

  const ownerId = useMemo(() => {
    return data?.dao?.datum?.ownerId;
  }, [data?.dao?.datum?.ownerId]);
  const skipClick = useCallback(() => {
    const nowIndex = firstConfigStep.indexOf(status || '');
    if (nowIndex === -1) return;
    if (nowIndex > 0) {
      history.push(`/dao/${daoId}`);
    } else {
      const nextStep = firstConfigStep[(nowIndex + 1) % 2];
      if (nextStep.startsWith('job')) goTab('job');
      if (nextStep.startsWith('token')) goTab('token');
      history.push({
        pathname: `/dao/${daoId}/config`,
        query: {
          status: nextStep,
        },
      });
    }
  }, [daoId, goTab, status]);

  if (loading || error) {
    return <PageLoading />;
  }

  if (!isDaoOwner(ownerId || '')) {
    return <PermissionErrorPage />;
  }

  return (
    <>
      {!!status && (
        <Button type="link" className={styles.skipButton} onClick={skipClick}>
          <FormattedMessage id={`pages.dao.config.tab.skip`} />
        </Button>
      )}
      <PageContainer
        ghost
        header={{ breadcrumbRender: () => <GlobalBreadcrumb routes={breadcrumb(daoId)} /> }}
      >
        <div className={styles.first}>
          {!status && (
            <Tabs defaultActiveKey={tab} onChange={goTab}>
              {configTab}
            </Tabs>
          )}
          {tab === 'job' && (
            <DAOJobConfig daoId={daoId} nextStep={status ? skipClick : undefined} />
          )}
          {tab === 'token' && (
            <TokenConfig
              daoId={daoId}
              tokenSymbol={data?.dao?.datum?.tokenSymbol || ''}
              subType={subType || 'create'}
            />
          )}
        </div>
      </PageContainer>
    </>
  );
};
