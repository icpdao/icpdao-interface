import { Tabs } from 'antd';
import React, { useState } from 'react';
import StatCard from '@/components/StatCard';
import { useIntl } from '@@/plugin-locale/localeExports';
import { FormattedMessage } from 'umi';
import { DaoCycleIcpper, OwnerDaoCycleIcpper } from './icpper';
import { DaoCycleJob, OwnerDaoCycleJob } from './job';
import DaoCycleVote from './vote';
import styles from './index.less';
import type { CycleSchema } from '@/services/dao/generated';
import { useCycleStatDataQuery } from '@/services/dao/generated';
import { PageLoading } from '@ant-design/pro-layout';

const { TabPane } = Tabs;

export type DaoCycleProps = {
  cycleId: string;
  cycle?: CycleSchema;
  userRole?: 'no_login' | 'normal' | 'pre_icpper' | 'icpper' | 'owner';
  activeTab?: 'icpper' | 'job' | 'vote';
  daoId?: string;
  tokenSymbol: string;
};

const DaoCycleIndex: React.FC<DaoCycleProps> = ({
  cycleId,
  cycle,
  daoId,
  userRole,
  activeTab,
  tokenSymbol,
}) => {
  const intl = useIntl();
  const [currentTab, setCurrentTab] = useState<string>(activeTab || 'icpper');
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
      title: tokenSymbol,
      number: data?.cycle?.stat?.size || 0,
    },
  ];

  return (
    <>
      <StatCard data={statCardData} />
      <Tabs
        className={styles.tabSecond}
        defaultActiveKey={activeTab}
        type="card"
        onChange={setCurrentTab}
      >
        <TabPane
          tab={<FormattedMessage id={'pages.dao.component.dao_cycle.tab.icpper'} />}
          key="icpper"
        >
          {currentTab === 'icpper' && userRole === 'owner' && (
            <OwnerDaoCycleIcpper
              cycle={cycle}
              cycleId={cycleId}
              daoId={daoId}
              tokenSymbol={tokenSymbol}
            />
          )}
          {currentTab === 'icpper' && userRole !== 'owner' && (
            <DaoCycleIcpper cycleId={cycleId} daoId={daoId} tokenSymbol={tokenSymbol} />
          )}
        </TabPane>

        <TabPane tab={<FormattedMessage id={'pages.dao.component.dao_cycle.tab.job'} />} key="job">
          {currentTab === 'job' && userRole === 'owner' && (
            <OwnerDaoCycleJob
              cycle={cycle}
              cycleId={cycleId}
              daoId={daoId}
              tokenSymbol={tokenSymbol}
            />
          )}
          {currentTab === 'job' && userRole !== 'owner' && (
            <DaoCycleJob cycleId={cycleId} daoId={daoId} tokenSymbol={tokenSymbol} />
          )}
        </TabPane>

        <TabPane
          tab={<FormattedMessage id={'pages.dao.component.dao_cycle.tab.vote'} />}
          key="vote"
        >
          {currentTab === 'vote' && (
            <DaoCycleVote
              cycleId={cycleId}
              cycle={cycle}
              userRole={userRole}
              tokenSymbol={tokenSymbol}
            />
          )}
        </TabPane>
      </Tabs>
    </>
  );
};

export default DaoCycleIndex;
