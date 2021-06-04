import { Select, Tabs } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import StatCard from '@/components/StatCard';
import { useIntl } from '@@/plugin-locale/localeExports';
import { FormattedMessage } from 'umi';
import DaoCycleIcpper from '@/pages/Dao/components/DaoCycleIcpper';
import DaoCycleJob from '@/pages/Dao/components/DaoCycleJob';
import DaoCycleVote from '@/pages/Dao/components/DaoCycleVote';

const { TabPane } = Tabs;

const mockOptions: any = [
  {
    label: 'luxi',
    value: 'lucy',
  },
];

type DaoCycleProps = {
  daoId: string;
};

const DaoCycle: React.FC<DaoCycleProps> = ({ daoId }) => {
  const defaultActiveKey = 'icpper';
  const [loading, setLoading] = useState<boolean>(true);
  const [options, setOptions] = useState([]);
  const intl = useIntl();

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setOptions(mockOptions);
      setLoading(false);
    }, 1000);
  }, []);

  const statCardData = useMemo(() => {
    return [
      {
        title: intl.formatMessage({ id: 'pages.dao.component.dao_cycle.stat.icpper' }),
        number: 1,
      },
      {
        title: intl.formatMessage({ id: 'pages.dao.component.dao_cycle.stat.job' }),
        number: 2,
      },
      {
        title: intl.formatMessage({ id: 'pages.dao.component.dao_cycle.stat.size' }),
        number: 3,
      },
      {
        title: '/SHT',
        number: 4,
      },
    ];
  }, [intl]);

  return (
    <div>
      <Select style={{ width: 250 }} loading={loading} options={options} />
      <StatCard data={statCardData} />
      <Tabs defaultActiveKey={defaultActiveKey} type="card">
        <TabPane
          tab={<FormattedMessage id={'pages.dao.component.dao_cycle.tab.icpper'} />}
          key="icpper"
        >
          <DaoCycleIcpper daoId={daoId} />
        </TabPane>

        <TabPane tab={<FormattedMessage id={'pages.dao.component.dao_cycle.tab.job'} />} key="job">
          <DaoCycleJob daoId={daoId} />
        </TabPane>

        <TabPane
          tab={<FormattedMessage id={'pages.dao.component.dao_cycle.tab.vote'} />}
          key="vote"
        >
          <DaoCycleVote daoId={daoId} />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default DaoCycle;
