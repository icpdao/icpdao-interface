// import type { ReactNode } from 'react';
// import { PageContainer, PageLoading } from '@ant-design/pro-layout';
// import { Tabs } from 'antd';
// import { FormattedMessage, useAccess } from 'umi';
// import GlobalBreadcrumb from '@/components/Breadcrumb';
// import { HomeOutlined } from '@ant-design/icons';
// import { useModel } from '@@/plugin-model/useModel';
//
// import PermissionErrorPage from '@/pages/403';
// import styles from './index.less';
//
// const breadcrumb = [
//   {
//     icon: <HomeOutlined />,
//     path: '',
//     breadcrumbName: 'HOME',
//     menuId: 'home',
//   },
//   {
//     path: '/job',
//     breadcrumbName: 'JOB',
//     menuId: 'job',
//   },
// ];
//
// export default (props: {
//   location: { query: { userName: string | undefined, daoId: string | undefined } },
//   match: { params: { cycleId: string } }
// }): ReactNode => {
//   const { initialState } = useModel('@@initialState');
//   const access = useAccess();
//
//   if (!initialState) {
//     return <PageLoading />;
//   }
//
//   if (!access.isIcpper()) {
//     return <PermissionErrorPage />;
//   }
//
//   return (
//     <>
//       <PageContainer
//         ghost
//         header={{ breadcrumbRender: () => <GlobalBreadcrumb routes={breadcrumb} /> }}
//       >
//         <div className={styles.first}>
//         </div>
//       </PageContainer>
//     </>
//   );
// };
