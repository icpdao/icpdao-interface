import type { ReactNode } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { FormattedMessage, useIntl } from 'umi';
import styles from './index.less';
import GlobalBreadcrumb from '@/components/Breadcrumb';
import { HomeOutlined } from '@ant-design/icons';
import { useModel } from '@@/plugin-model/useModel';
import { Form, Input, Button, message } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { updateUserProfile } from '@/services/icpdao-interface/user';
import PermissionErrorPage from '@/pages/Result/403';
import { useAccess } from '@@/plugin-access/access';

export default (): ReactNode => {
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');
  const [form] = Form.useForm();
  const { isLogin } = useAccess();
  const [submitButtonLoading, setSubmitButtonLoading] = useState(false);

  useEffect(() => {
    form.setFieldsValue({ erc20Address: initialState?.currentUser().profile?.erc20_address });
  }, [form, initialState]);

  const handleSubmitWallet = useCallback(
    async (values: { erc20Address: string }) => {
      setSubmitButtonLoading(true);
      await updateUserProfile({ erc20_address: values.erc20Address });
      if (initialState?.fetchUserInfo) await initialState.fetchUserInfo();
      setSubmitButtonLoading(false);
      message.success(intl.formatMessage({ id: 'pages.account.wallet.save_success' }));
      return true;
    },
    [initialState, intl],
  );

  if (!isLogin()) {
    return <PermissionErrorPage />;
  }

  const breadcrumb = [
    {
      icon: <HomeOutlined />,
      path: '/',
      breadcrumbName: 'HOME',
      menuId: 'home',
    },
    {
      path: '/account/wallet',
      breadcrumbName: 'WALLET',
      menuId: 'wallet',
    },
  ];

  return (
    <PageContainer
      ghost
      header={{ breadcrumbRender: (): ReactNode => <GlobalBreadcrumb routes={breadcrumb} /> }}
    >
      <div className={styles.first}>
        <FormattedMessage id={'pages.account.wallet.tips'} />
      </div>
      <Form
        form={form}
        layout="horizontal"
        className={styles.second}
        labelCol={{ span: 3 }}
        wrapperCol={{ span: 15 }}
        name="walletForm"
        onFinish={handleSubmitWallet}
      >
        <Form.Item
          name="erc20Address"
          hasFeedback
          labelAlign={'left'}
          label={intl.formatMessage({ id: 'pages.account.wallet.label' })}
          rules={[
            {
              required: true,
              message: intl.formatMessage({ id: 'pages.account.wallet.input.placeholder' }),
            },
            {
              pattern: /^(0x)?[0-9a-fA-F]{40}$/,
              message: intl.formatMessage({ id: 'pages.account.wallet.save.warning' }),
            },
          ]}
        >
          <Input
            placeholder={intl.formatMessage({ id: 'pages.account.wallet.input.placeholder' })}
            id={'erc20Address'}
          />
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 3, span: 15 }}>
          <Button loading={submitButtonLoading} type="primary" htmlType="submit">
            {intl.formatMessage({ id: 'pages.account.wallet.save' })}
          </Button>
        </Form.Item>
      </Form>
    </PageContainer>
  );
};
