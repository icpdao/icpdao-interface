import type {ReactNode} from "react";
import {PageContainer, PageLoading} from '@ant-design/pro-layout';
import {FormattedMessage, useIntl} from 'umi';
import styles from './index.less';
import GlobalBreadcrumb from "@/components/Breadcrumb";
import {HomeOutlined} from '@ant-design/icons';
import {useModel} from "@@/plugin-model/useModel";
import { Form, Input, Button } from 'antd';
import {useState} from "react";
import {updateUserProfile} from "@/services/icpdao-interface/user";

export default (): ReactNode => {
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');
  const [form] = Form.useForm();
  const [submitButtonLoading, setSubmitButtonLoading] = useState(false);
  if (!initialState) {
    return <PageLoading />;
  }
  const { profile }: {profile: API.UserProfile} = initialState.currentUser();
  const breadcrumb = [
    {
      icon: <HomeOutlined />,
      path: '/',
      breadcrumbName: 'HOME',
      menuId: 'home'
    },
    {
      path: '/account/wallet',
      breadcrumbName: 'WALLET',
      menuId: 'wallet'
    }
  ]

  profile.erc20_address = profile.erc20_address || '';

  const handleSubmitWallet = async (values: {erc20Address: string}) => {
    setSubmitButtonLoading(true);
    await updateUserProfile({erc20_address: values.erc20Address})
    setSubmitButtonLoading(false);
  }

  return (
    <PageContainer
      ghost
      header={{breadcrumbRender: (): ReactNode => <GlobalBreadcrumb routes={breadcrumb} />}}
    >
      <div className={styles.first}>
        <FormattedMessage id={'pages.account.wallet.tips'} />
      </div>
      <Form form={form} layout="horizontal"
            className={styles.second}
            labelCol={{span: 3}}
            wrapperCol={{span: 15}}
            name="walletForm"
            initialValues={{erc20Address: profile.erc20_address}}
            onFinish={handleSubmitWallet}
      >
        <Form.Item
          name="erc20Address"
          hasFeedback
          labelAlign={'left'}
          label={intl.formatMessage({id: 'pages.account.wallet.label'})}
          rules={[{
            required: true,
            message: intl.formatMessage({id: 'pages.account.wallet.input.placeholder'})
          }, {
            pattern: /^(0x)?[0-9a-fA-F]{40}$/,
            message: intl.formatMessage({id: 'pages.account.wallet.save.warning'})
          }]}>
          <Input placeholder={intl.formatMessage({id: 'pages.account.wallet.input.placeholder'})} id={'erc20Address'} />
        </Form.Item>
        <Form.Item wrapperCol={{offset: 3, span: 15}}>
          <Button loading={submitButtonLoading} type="primary" htmlType="submit">
            {intl.formatMessage({id: 'pages.account.wallet.save'})}
          </Button>
        </Form.Item>
      </Form>

    </PageContainer>
  );
}
