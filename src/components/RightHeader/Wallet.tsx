import React, { useCallback, useEffect, useState } from 'react';
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
    account,
    chainId,
    setAccounts,
  } = useModel('useWalletModel');

  const connectMetamask = useCallback(async () => {
    if (!metamaskProvider) {
      window.location.href = 'https://metamask.io/';
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
        setMetamaskDisconnect();
        setIsConnected(false);
      }
    },
    [setIsConnected],
  );

  event$.useSubscription(() => {
    setConnectWalletModal(true);
  });

  return (
    <>
      {chainId?.toString() != ICPDAO_MINT_TOKEN_ETH_CHAIN_ID && isConnected && (
        <Modal
          visible
          bodyStyle={{
            paddingTop: 62,
            textAlign: 'center',
            fontWeight: 400,
            padding: '62px 30px 20px 30px',
          }}
          style={{ top: '15px' }}
          keyboard={false}
          zIndex={2001}
          footer={null}
          title={null}
        >
          ICPDAO is under testing, Please switch the network of metamask to Ropsten.
        </Modal>
      )}
      <Modal
        visible={connectWalletModal}
        maskClosable={true}
        destroyOnClose={true}
        bodyStyle={{
          paddingTop: 62,
          textAlign: 'center',
          fontWeight: 400,
          padding: '62px 30px 20px 30px',
        }}
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
