import { Space } from 'antd';
import React from 'react';
import { useModel, setLocale } from 'umi';
import Avatar from './AvatarDropdown';
import styles from './index.less';
// import IconFont from '@/components/IconFont';
// import { updateTheme } from '@/components/RightHeader/Theme';
// import { getTheme } from '@/utils/utils';
import Wallet from './Wallet';

const GlobalHeaderRight: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  // const [theme, setTheme] = useState<MenuTheme>(getTheme());
  // const willTheme: MenuTheme = theme === 'dark' ? 'light' : 'dark';
  // useEffect(() => {
  //   updateTheme(theme === 'dark');
  // });

  if (!initialState || !initialState.settings) {
    return null;
  }

  setLocale('en-US', false);
  return (
    <Space size={23} className={styles.right}>
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
      <Wallet />
      <Avatar />
    </Space>
  );
};

export default GlobalHeaderRight;
