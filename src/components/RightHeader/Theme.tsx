export const updateTheme = (dark: boolean, color?: string, publicPath = '/theme') => {
  if (typeof window === 'undefined' || !(window as any).umi_plugin_ant_themeVar) {
    return;
  }

  if (THEME === 'light') {
    const body = document.getElementsByTagName('body')[0];
    body.className = `body-wrap-light`;
    return;
  }

  const href = dark ? `${publicPath}/dark` : `${publicPath}/light`;
  let colorFileName =
    dark && color ? `-${encodeURIComponent(color)}` : encodeURIComponent(color || '');
  if (color === 'daybreak' && dark) {
    colorFileName = '';
  }

  const dom = document.getElementById('theme-style') as HTMLLinkElement;

  // 如果这两个都是空
  if (!href && !colorFileName) {
    if (dom) {
      dom.remove();
      localStorage.removeItem('site-theme');
    }
    return;
  }

  const url = `${href}${colorFileName || ''}.css`;
  if (dom) {
    dom.href = url;
  } else {
    const style = document.createElement('link');
    style.type = 'text/css';
    style.rel = 'stylesheet';
    style.id = 'theme-style';
    style.href = url;
    if (document.body.append) {
      document.body.append(style);
    } else {
      document.body.appendChild(style);
    }
  }

  const body = document.getElementsByTagName('body')[0];
  body.className = `body-wrap-${dark ? 'dark' : 'light'}`;
  localStorage.setItem('site-theme', dark ? 'dark' : 'light');
};
