import { Space } from 'antd';
import React, { useEffect } from 'react';
import { useModel, setLocale } from 'umi';
import Avatar from './AvatarDropdown';
import styles from './index.less';
// import IconFont from '@/components/IconFont';
// import { updateTheme } from '@/components/RightHeader/Theme';
// import { getTheme } from '@/utils/utils';
import Wallet from './Wallet';
import Guide from './Guide';
import { updateTheme } from '@/components/RightHeader/Theme';
import { useAccess } from '@@/plugin-access/access';

const GlobalHeaderRight: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  // const [theme, setTheme] = useState<MenuTheme>(getTheme());
  // const willTheme: MenuTheme = theme === 'dark' ? 'light' : 'dark';
  useEffect(() => {
    updateTheme(false);
    setLocale('en-US', false);
  });
  const access = useAccess();

  if (!initialState || !initialState.settings) {
    return null;
  }

  return (
    <Space size={20} className={styles.right}>
      <div>
        {/* <IconFont */}
        {/*   type={`icon-${willTheme}-theme`} */}
        {/*   className={styles.switchTheme} */}
        {/*   onClick={() => { */}
        {/*     updateTheme(willTheme === 'dark'); */}
        {/*     setTheme(willTheme); */}
        {/*   }} */}
        {/* /> */}
      </div>
      <Guide isLogin={access.isLogin()} />
      <Wallet />
      <Avatar />
    </Space>
  );
};

export default GlobalHeaderRight;
