import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './index.less';
import {
  AimOutlined,
  ApartmentOutlined,
  WalletOutlined,
  DisconnectOutlined,
} from '@ant-design/icons';
import { Modal, Card, Space, Menu } from 'antd';
import HeaderDropdown from '../HeaderDropdown';
import IconFont from '@/components/IconFont';
import { FormattedMessage } from 'umi';
import { useModel } from '@@/plugin-model/useModel';
import { EthereumNetwork, setMetamaskConnect, setMetamaskDisconnect } from '@/utils/utils';
import { history } from '@@/core/history';

const Wallet: React.FC = () => {
  const [connectWalletModal, setConnectWalletModal] = useState<boolean>(false);
  const {
    event$,
    network,
    metamaskProvider,
    isConnected,
    setIsConnected,
    setNetwork,
    accounts,
    setAccounts,
  } = useModel('useWalletModel');

  const connectMetamask = useCallback(async () => {
    if (!metamaskProvider) {
      history.push('https://metamask.io/');
      return;
    }
    setAccounts(await metamaskProvider.request({ method: 'eth_requestAccounts' }));
    setNetwork(EthereumNetwork[await metamaskProvider.request({ method: 'eth_chainId' })]);
  }, [metamaskProvider, setAccounts, setNetwork]);

  useEffect(() => {
    console.log(accounts);
    if (accounts.length > 0) {
      setMetamaskConnect();
      setIsConnected(true);
      setConnectWalletModal(false);
    }
  }, [accounts, setIsConnected]);

  const getConnectWalletBody = useCallback(() => {
    return (
      <Card bordered={false}>
        <Card.Grid style={{ width: '100%' }} className={styles.connectWalletCard}>
          <Space
            direction={'vertical'}
            onClick={async () => {
              await connectMetamask();
            }}
          >
            <IconFont
              type={`icon-metamask`}
              className={styles.connectWalletIcon}
              onClick={() => {}}
            />
            <div className={styles.connectWalletName}>
              <FormattedMessage id={`component.header.wallet.connect.metamask`} />
            </div>
            <div className={styles.connectWalletDesc}>
              <FormattedMessage id={`component.header.wallet.connect.metamask.desc`} />
            </div>
          </Space>
        </Card.Grid>
      </Card>
    );
  }, [connectMetamask]);

  const handlerClickMenu = useCallback(
    (event: { key: string; keyPath: string[] }) => {
      const { key } = event;
      if (key === 'disconnect') {
        setIsConnected(false);
        setMetamaskDisconnect();
      }
    },
    [setIsConnected],
  );
  const account = useMemo(() => (accounts.length > 0 ? accounts[0] : ''), [accounts]);

  event$.useSubscription(() => {
    setConnectWalletModal(true);
  });

  return (
    <>
      <Modal
        visible={connectWalletModal}
        maskClosable={true}
        destroyOnClose={true}
        maskStyle={{ top: 64, height: 'calc(100% - 130px)' }}
        bodyStyle={{
          paddingTop: 62,
          textAlign: 'center',
          fontWeight: 400,
          padding: '62px 30px 20px 30px',
        }}
        width={493}
        centered
        footer={null}
        onOk={() => {}}
        onCancel={() => setConnectWalletModal(false)}
      >
        {getConnectWalletBody()}
      </Modal>
      {!isConnected && (
        <WalletOutlined onClick={() => setConnectWalletModal(true)} className={styles.walletIcon} />
      )}
      {isConnected && (
        <HeaderDropdown
          overlay={
            <Menu className={styles.menu} onClick={handlerClickMenu}>
              <Menu.Item key={'network'}>
                <ApartmentOutlined />
                {network === 'homestead' ? 'mainnet' : network}
              </Menu.Item>
              <Menu.Item key={'account'}>
                <AimOutlined />
                {account?.substr(0, 6)}...
                {account?.substr(-4)}
              </Menu.Item>
              <Menu.Item key={'disconnect'}>
                <DisconnectOutlined />
                <FormattedMessage id={`component.header.wallet.disconnect`} />
              </Menu.Item>
            </Menu>
          }
        >
          <span className={`${styles.action} ${styles.account}`}>
            <IconFont
              type={`icon-metamask`}
              className={styles.connectedWalletIcon}
              onClick={(e) => e.preventDefault()}
            />
          </span>
        </HeaderDropdown>
      )}
    </>
  );
};

export default Wallet;
