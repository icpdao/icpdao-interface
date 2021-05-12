import React from "react";
import {Space} from "antd";
import style from "./index.less";

import logo from '../../../public/logo.png';
import logoLong from '../../../public/logo_long.png';

const GlobalHeaderLeft: React.FC = () => {

  return (
    <Space className={style.header}>
      <img src={logo} height={40} width={40} alt="logo"/>
      <img src={logoLong} height={32} width={75} alt="logo"/>
    </Space>
  );
};
export default GlobalHeaderLeft;
