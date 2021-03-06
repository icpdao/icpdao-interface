import { Select, Empty } from 'antd';
import React, { useEffect, useState } from 'react';
import DaoCycleIndex from './cycle/index';
import styles from './cycle/index.less';
import type { CycleSchema } from '@/services/dao/generated';
import { useDaoCycleQuery } from '@/services/dao/generated';
import { PageLoading } from '@ant-design/pro-layout';
import { getFormatTimeByZone } from '@/utils/utils';

export type DaoCycleProps = {
  daoId: string;
  userRole: 'no_login' | 'normal' | 'pre_icpper' | 'icpper' | 'owner';
  tokenSymbol: string;
};

const DaoCycle: React.FC<DaoCycleProps> = ({ daoId, userRole, tokenSymbol }) => {
  const defaultActiveKey = 'icpper';
  const [options, setOptions] = useState([]);
  const [cycleId, setCycleId] = useState('');
  const [currentCycle, setCurrentCycle] = useState<CycleSchema>();
  const { data, loading, error } = useDaoCycleQuery({ variables: { daoId } });
  useEffect(() => {
    const ops = data?.dao?.cycles?.nodes?.map((c, index) => {
      const begin_time = getFormatTimeByZone(c?.datum?.beginAt || 0, c?.datum?.timeZone || 0, 'LL');
      const end_time = getFormatTimeByZone(c?.datum?.endAt || 0, c?.datum?.timeZone || 0, 'LL');
      if (index === 0) {
        setCycleId(c?.datum?.id || '');
        setCurrentCycle(c?.datum as CycleSchema);
      }
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
      {cycleId ? (
        <>
          <Select
            className={styles.tabSelect}
            value={cycleId}
            style={{ width: 300 }}
            onChange={(value) => {
              data?.dao?.cycles?.nodes?.forEach((c) => {
                if (c?.datum?.id === (value as string)) {
                  setCycleId(value as string);
                  setCurrentCycle(c?.datum as CycleSchema);
                }
              });
            }}
            options={options}
          />
          <DaoCycleIndex
            daoId={daoId}
            cycleId={cycleId}
            cycle={currentCycle}
            userRole={userRole}
            activeTab={defaultActiveKey}
            tokenSymbol={tokenSymbol}
          />
        </>
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </div>
  );
};

export default DaoCycle;
