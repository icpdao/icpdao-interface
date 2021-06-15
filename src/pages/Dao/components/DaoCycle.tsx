import { Select } from 'antd';
import React, { useEffect, useState } from 'react';
import DaoCycleIndex from './cycle/index';
import styles from './index.less';
import { useDaoCycleQuery } from '@/services/dao/generated';
import { PageLoading } from '@ant-design/pro-layout';
import { getFormatTimeByZone } from '@/utils/utils';

export type DaoCycleProps = {
  daoId: string;
  userRole: 'owner' | 'icpper' | 'normal';
};

const DaoCycle: React.FC<DaoCycleProps> = ({ daoId, userRole }) => {
  const defaultActiveKey = 'icpper';
  const [options, setOptions] = useState([]);
  const [cycleId, setCycleId] = useState('');
  const { data, loading, error } = useDaoCycleQuery({ variables: { daoId } });
  useEffect(() => {
    const ops = data?.dao?.cycles?.nodes?.map((c) => {
      const begin_time = getFormatTimeByZone(c?.datum?.beginAt || 0, c?.datum?.timeZone || 0, 'LL');
      const end_time = getFormatTimeByZone(c?.datum?.endAt || 0, c?.datum?.timeZone || 0, 'LL');
      return {
        id: c?.datum?.id || '',
        value: c?.datum?.id || '',
        label: `${begin_time} - ${end_time}`,
      };
    });
    setOptions(ops as any);
  }, [data]);
  if (loading || error) {
    return <PageLoading />;
  }

  return (
    <div>
      <Select
        className={styles.tabSelect}
        style={{ width: 250 }}
        onChange={(value) => setCycleId(value as string)}
        loading={loading}
        options={options}
      />
      <DaoCycleIndex
        daoId={daoId}
        cycleId={cycleId}
        userRole={userRole}
        activeTab={defaultActiveKey}
      />
    </div>
  );
};

export default DaoCycle;
