import React from 'react';
import { Empty } from 'antd';

type DaoIcpperStatProps = {
  daoId: string;
};

const DaoIcpperStat: React.FC<DaoIcpperStatProps> = ({ daoId }) => {
  console.log('DaoIcpperStat', daoId);
  return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
};

export default DaoIcpperStat;
