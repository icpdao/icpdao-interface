import type { ReactNode } from 'react';
import { PageContainer, PageLoading } from '@ant-design/pro-layout';
import { Table } from 'antd';
import { useAccess, useIntl } from 'umi';
import styles from './index.less';
import GlobalBreadcrumb from '@/components/Breadcrumb';
import { HomeOutlined } from '@ant-design/icons';
import { useModel } from '@@/plugin-model/useModel';
import PermissionErrorPage from '@/pages/Result/403';

export default (): ReactNode => {
  const intl = useIntl();
  const { hadMentor } = useAccess();
  const { initialState } = useModel('@@initialState');

  if (!initialState) {
    return <PageLoading />;
  }

  if (!hadMentor()) {
    return <PermissionErrorPage />;
  }

  const { profile } = initialState.currentUser();
  const breadcrumb = [
    {
      icon: <HomeOutlined />,
      path: '/',
      breadcrumbName: 'HOME',
      menuId: 'home',
    },
    {
      path: '/account/mentor',
      breadcrumbName: 'MENTOR',
      menuId: 'mentor',
    },
  ];
  const mentorTableColumns = [
    {
      title: intl.formatMessage({ id: 'pages.account.mentor.table.column.1' }),
      dataIndex: 'nickname',
      key: 'nickname',
    },
    {
      title: intl.formatMessage({ id: 'pages.account.mentor.table.column.2' }),
      dataIndex: 'github_login',
      key: 'github_login',
    },
    {
      title: intl.formatMessage({ id: 'pages.account.mentor.table.column.3' }),
      dataIndex: 'number_of_instructors',
      key: 'number_of_instructors',
    },
  ];
  const mentor = [
    {
      key: '1',
      ...profile?.icppership?.mentor,
    },
  ];
  return (
    <PageContainer
      ghost
      header={{ breadcrumbRender: (): ReactNode => <GlobalBreadcrumb routes={breadcrumb} /> }}
    >
      <div className={styles.first}>
        <Table
          pagination={false}
          columns={mentorTableColumns}
          dataSource={mentor}
          locale={{ emptyText: 'No Data' }}
        />
      </div>
    </PageContainer>
  );
};
