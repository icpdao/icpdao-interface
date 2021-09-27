import React from 'react';
import { Space } from 'antd';
import style from './index.less';

import logoLong from '../../../public/logo_long.png';

const GlobalHeaderLeft: React.FC = () => {
  return (
    <Space className={style.header}>
      <img src={logoLong} height={35} alt="logo" />
    </Space>
  );
};
export default GlobalHeaderLeft;
