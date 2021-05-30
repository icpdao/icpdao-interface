import React from 'react';
import type { BreadcrumbProps } from 'antd/es/breadcrumb';
import { Breadcrumb } from 'antd';
import { Link } from 'umi';
import type { Route } from 'antd/es/breadcrumb/Breadcrumb';
import { FormattedMessage } from 'umi';
import styles from './index.less';

function itemRender(route: any, params: any, routes: any) {
  const last = routes.indexOf(route) === routes.length - 1;
  if (last) {
    return <FormattedMessage id={`menu.${route.menuId}`} />;
  }
  let name = route.breadcrumbName;
  if (route.menuId) {
    name = <FormattedMessage id={`menu.${route.menuId}`} />;
  }
  if (route.icon) {
    return (
      <Link to={route.path}>
        <span className={styles.icon}>{route.icon}</span>
        <span className={styles.name}>{name}</span>
      </Link>
    );
  }
  return <Link to={route.path}>{name}</Link>;
}

export type IconRoute = {
  icon?: React.ReactNode;
  menuId?: string;
} & Route;

export type GlobalBreadcrumbProps = {
  routes: IconRoute[];
} & Omit<BreadcrumbProps, 'routes'>;

const GlobalBreadcrumb: React.FC<GlobalBreadcrumbProps> = ({ routes: rts, ...restProps }) => (
  <Breadcrumb itemRender={itemRender} routes={rts} {...restProps} />
);

export default GlobalBreadcrumb;
