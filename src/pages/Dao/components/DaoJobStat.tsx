import React from 'react';
import { Empty } from 'antd';

type DaoJobSatProps = {
  daoId: string;
};

const DaoJobStat: React.FC<DaoJobSatProps> = ({ daoId }) => {
  console.log('DaoJobStat', daoId);
  return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
};

export default DaoJobStat;
