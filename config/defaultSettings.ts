import { Settings as LayoutSettings } from '@ant-design/pro-layout';

const Settings: LayoutSettings & {
  pwa?: boolean;
  logo?: string;
} = {
  navTheme: 'light',
  // 拂晓蓝
  primaryColor: '#1890ff',
  layout: 'mix',
  contentWidth: 'Fixed',
  menuRender: false,
  fixedHeader: false,
  fixSiderbar: true,
  colorWeak: false,
  title: false,
  pwa: false,
  headerHeight: 64,
  headerTheme: 'light',
  logo: 'https://sibbay-data-mark-test.oss-cn-hangzhou.aliyuncs.com/icon.png',
  iconfontUrl: '',
};

export default Settings;
