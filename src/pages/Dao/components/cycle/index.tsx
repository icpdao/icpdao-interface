import { Tabs } from 'antd';
import React from 'react';
import StatCard from '@/components/StatCard';
import { useIntl } from '@@/plugin-locale/localeExports';
import { FormattedMessage } from 'umi';
import { DaoCycleIcpper, OwnerDaoCycleIcpper } from './icpper';
import { DaoCycleJob, OwnerDaoCycleJob } from './job';
import DaoCycleVote from './vote';
import styles from './index.less';
import { useCycleStatDataQuery } from '@/services/dao/generated';
import { PageLoading } from '@ant-design/pro-layout';

const { TabPane } = Tabs;

export type DaoCycleProps = {
  cycleId: string;
  userRole?: 'owner' | 'icpper' | 'normal';
  activeTab?: 'icpper' | 'job' | 'vote';
  daoId?: string;
};

const DaoCycleIndex: React.FC<DaoCycleProps> = ({ cycleId, daoId, userRole, activeTab }) => {
  const intl = useIntl();
  const { data, loading, error } = useCycleStatDataQuery({ variables: { cycleId } });

  if (loading || error) {
    return <PageLoading />;
  }

  const statCardData = [
    {
      title: intl.formatMessage({ id: 'pages.dao.component.dao_cycle.stat.icpper' }),
      number: data?.cycle?.stat?.icpperCount || 0,
    },
    {
      title: intl.formatMessage({ id: 'pages.dao.component.dao_cycle.stat.job' }),
      number: data?.cycle?.stat?.jobCount || 0,
    },
    {
      title: intl.formatMessage({ id: 'pages.dao.component.dao_cycle.stat.size' }),
      number: data?.cycle?.stat?.size || 0,
    },
    {
      title: '/SHT',
      number: 0,
    },
  ];

  return (
    <>
      <StatCard data={statCardData} />
      <Tabs className={styles.tabSecond} defaultActiveKey={activeTab} type="card">
        <TabPane
          tab={<FormattedMessage id={'pages.dao.component.dao_cycle.tab.icpper'} />}
          key="icpper"
        >
          {userRole === 'owner' && <OwnerDaoCycleIcpper cycleId={cycleId} daoId={daoId} />}
          {userRole !== 'owner' && <DaoCycleIcpper cycleId={cycleId} daoId={daoId} />}
        </TabPane>

        <TabPane tab={<FormattedMessage id={'pages.dao.component.dao_cycle.tab.job'} />} key="job">
          {userRole === 'owner' && <DaoCycleJob cycleId={cycleId} daoId={daoId} />}
          {userRole !== 'owner' && <OwnerDaoCycleJob cycleId={cycleId} daoId={daoId} />}
        </TabPane>

        <TabPane
          tab={<FormattedMessage id={'pages.dao.component.dao_cycle.tab.vote'} />}
          key="vote"
        >
          <DaoCycleVote cycleId={cycleId} userRole={userRole} />
        </TabPane>
      </Tabs>
    </>
  );
};

export default DaoCycleIndex;
