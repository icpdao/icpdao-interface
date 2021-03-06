import React, { useCallback, useMemo, useState } from 'react';
import type { TokenConfigComponentsProps } from '@/pages/Dao/components/TokenConfig';
import { Button, Form, Input, List, Skeleton, Spin } from 'antd';
import { useIntl } from '@@/plugin-locale/localeExports';
import { DeleteOutlined } from '@ant-design/icons';
import { isAddress } from 'ethers/lib/utils';
import IconFont from '@/components/IconFont';

type validInfo = {
  status: Parameters<typeof Form.Item>[0]['validateStatus'];
  help: string;
};

const TokenManager: React.FC<TokenConfigComponentsProps> = ({ tokenContract }) => {
  const intl = useIntl();
  const [managers, setManagers] = useState<string[]>();
  const [addManager, setAddManager] = useState<string>('');
  const [loadingTransferComplete, setLoadingTransferComplete] = useState<boolean>(false);
  const [addButtonLoading, setAddButtonLoading] = useState<boolean>(false);
  const [formValid, setFormValid] = useState<validInfo>();
  const [removeButtonLoading, setRemoveButtonLoading] = useState<Record<string, boolean>>({});

  useMemo(async () => {
    if (!tokenContract) return;
    setManagers(await tokenContract.getManagers());
  }, [tokenContract]);

  const handlerAddManager = useCallback(async () => {
    if (!tokenContract) return;
    try {
      setAddButtonLoading(true);
      const tx = await tokenContract.addManager(addManager);
      setAddButtonLoading(false);

      setLoadingTransferComplete(true);
      const deployEvent = (await tx.wait()).events.pop();
      setManagers(await tokenContract.getManagers());
      setLoadingTransferComplete(false);
      console.log(deployEvent.args);
    } catch (e) {
      console.log(e);
      setAddButtonLoading(false);
      setLoadingTransferComplete(false);
    } finally {
      setAddManager('');
    }
  }, [addManager, tokenContract]);
  const handlerRemoveManager = useCallback(
    async (managerAddress: string) => {
      if (!tokenContract) return;
      try {
        setRemoveButtonLoading((old) => ({ ...old, managerAddress: true }));
        const tx = await tokenContract.removeManager(managerAddress);
        setRemoveButtonLoading((old) => ({ ...old, managerAddress: false }));

        setLoadingTransferComplete(true);
        const deployEvent = (await tx.wait()).events.pop();
        setManagers(await tokenContract.getManagers());
        setLoadingTransferComplete(false);
        console.log(deployEvent.args);
      } catch (e) {
        setRemoveButtonLoading((old) => ({ ...old, managerAddress: false }));
        setLoadingTransferComplete(false);
      }
    },
    [tokenContract],
  );

  if (managers === undefined) {
    return <Skeleton active />;
  }

  return (
    <>
      <Spin
        tip={intl.formatMessage({ id: 'pages.dao.config.tab.token.manager.loading' })}
        spinning={loadingTransferComplete}
      >
        <List
          header={
            <div>
              {intl.formatMessage({ id: 'pages.dao.config.tab.token.manager.list.header' })}
            </div>
          }
          bordered
          style={{ width: 800, marginBottom: 20 }}
          itemLayout="horizontal"
          dataSource={managers}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button
                  type={'link'}
                  loading={removeButtonLoading[item]}
                  onClick={() => handlerRemoveManager(item)}
                >
                  <DeleteOutlined />
                </Button>,
              ]}
            >
              {item}
            </List.Item>
          )}
        />
        <Form layout={'inline'} name={'tokenManager'}>
          <Form.Item
            label={intl.formatMessage({ id: 'pages.dao.config.tab.token.manager.form.add' })}
            tooltip={{
              title: intl.formatMessage({
                id: 'pages.dao.config.tab.token.manager.form.add.desc',
              }),
              icon: <IconFont type={'icon-question'} />,
            }}
            validateStatus={formValid?.status}
            help={formValid?.help}
          >
            <Input
              style={{ width: '400px' }}
              value={addManager}
              onChange={(value) => {
                if (!isAddress(value.target.value)) {
                  setFormValid({
                    status: 'error',
                    help: intl.formatMessage({
                      id: 'pages.dao.config.tab.token.manager.form.help',
                    }),
                  });
                  return;
                }
                setAddManager(value.target.value);
              }}
            />
          </Form.Item>
          <Form.Item>
            <Button type={'primary'} onClick={handlerAddManager} loading={addButtonLoading}>
              {intl.formatMessage({ id: 'pages.dao.config.tab.token.manager.form.button.add' })}
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    </>
  );
};

export default TokenManager;
