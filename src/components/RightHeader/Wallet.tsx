import React, { useCallback, useMemo, useState } from 'react';
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
import { FormattedMessage, history } from 'umi';
import { useModel } from '@@/plugin-model/useModel';
import {
  EthereumNetwork,
  getMetamask,
  setMetamaskConnect,
  setMetamaskDisconnect,
} from '@/utils/utils';

type memamaskInfo =
  | undefined
  | {
      account?: string;
      network?: string;
    };

const Wallet: React.FC = () => {
  const [connectWalletModal, setConnectWalletModal] = useState<boolean>(false);
  const [connectedMetamaskInfo, setConnectedMetamaskInfo] = useState<memamaskInfo>(undefined);
  const { initialState } = useModel('@@initialState');

  const connectMetamask = useCallback(async () => {
    const provider: any = initialState?.provider;
    if (!provider) {
      history.push('https://metamask.io/');
      return;
    }
    const accounts: string[] = await provider.request({ method: 'eth_requestAccounts' });
    const chainId: string = await provider.request({ method: 'eth_chainId' });
    console.log(accounts);
    if (accounts.length > 0) {
      setConnectedMetamaskInfo({ account: accounts[0], network: EthereumNetwork[chainId] });
      setMetamaskConnect();
      setConnectWalletModal(false);
    }
  }, [initialState]);

  useMemo(async () => {
    const provider: any = initialState?.provider;
    if (!provider) return;
    if (!provider.isConnected()) return;
    const accounts: string[] = await provider.request({ method: 'eth_accounts' });
    const chainId: string = await provider.request({ method: 'eth_chainId' });
    if (accounts.length > 0 && chainId && getMetamask() !== 'disconnect')
      setConnectedMetamaskInfo({ account: accounts[0], network: EthereumNetwork[chainId] });
    provider.on('accountsChanged', (acs: string[]) => {
      setConnectedMetamaskInfo((old) => ({
        ...old,
        account: acs[0],
      }));
    });
    provider.on('chainChanged', (cid: string) => {
      setConnectedMetamaskInfo((old) => ({
        ...old,
        network: EthereumNetwork[cid],
      }));
    });
  }, [initialState]);

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

  const handlerClickMenu = useCallback((event: { key: string; keyPath: string[] }) => {
    const { key } = event;
    if (key === 'disconnect') {
      setConnectedMetamaskInfo(undefined);
      setMetamaskDisconnect();
    }
  }, []);

  if (!initialState?.currentUser().profile || !initialState?.currentUser().profile.nickname) {
    return <></>;
  }

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
      {!connectedMetamaskInfo && (
        <WalletOutlined onClick={() => setConnectWalletModal(true)} className={styles.walletIcon} />
      )}
      {!!connectedMetamaskInfo && (
        <HeaderDropdown
          overlay={
            <Menu className={styles.menu} onClick={handlerClickMenu}>
              <Menu.Item key={'network'}>
                <ApartmentOutlined />
                {connectedMetamaskInfo.network === 'homestead'
                  ? 'mainnet'
                  : connectedMetamaskInfo.network}
              </Menu.Item>
              <Menu.Item key={'account'}>
                <AimOutlined />
                {connectedMetamaskInfo.account?.substr(0, 6)}...
                {connectedMetamaskInfo.account?.substr(-4)}
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
