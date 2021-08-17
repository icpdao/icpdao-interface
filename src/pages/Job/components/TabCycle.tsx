import React, { useMemo, useState } from 'react';
import { Select } from 'antd';

import { useUserJobDaoListQuery } from '@/services/dao/generated';
import UserCycleIcpperStatTable from '@/pages/Job/components/UserCycleIcpperStatTable';
import { PageLoading } from '@ant-design/pro-layout';

import styles from './TabCycle.less';

type TabCycleProps = {
  daoId?: string;
  userName?: string;
};

const { Option } = Select;

const TabCycle: React.FC<TabCycleProps> = ({ daoId, userName }) => {
  const [selectDaoName, setSelectDaoName] = useState<any>(null);

  const { data, loading, error } = useUserJobDaoListQuery({
    variables: { userName },
  });

  useMemo(() => {
    let result: any = null;
    if (data?.daos?.dao && data?.daos?.dao.length > 0) {
      data?.daos?.dao.forEach((d) => {
        if (daoId && d?.datum?.id === daoId) {
          result = d.datum;
        }
      });
      if (!result) {
        result = data.daos.dao[0]?.datum;
      }
    }

    setSelectDaoName(result?.name || null);
    return result;
  }, [daoId, data]);

  const daoOptions = useMemo(() => {
    return data?.daos?.dao?.map((d) => (
      <Option key={d?.datum?.id || ''} value={d?.datum?.id || ''}>
        {d?.datum?.name}
      </Option>
    ));
  }, [data]);

  if (loading || error) {
    return <PageLoading />;
  }

  return (
    <>
      <Select
        className={styles.select}
        showSearch
        optionFilterProp="children"
        filterOption={(input, option) => {
          return option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        }}
        notFoundContent={null}
        defaultValue={selectDaoName}
        onSelect={async (value, option) => {
          setSelectDaoName(option.children);
        }}
      >
        {daoOptions}
      </Select>
      <div className={styles.table}>
        <UserCycleIcpperStatTable userName={userName} daoName={selectDaoName} />
      </div>
    </>
  );
};

export default TabCycle;
