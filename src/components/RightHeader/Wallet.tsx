import React, { useCallback, useEffect, useState } from 'react';
import styles from './index.less';
import {
  AimOutlined,
  ApartmentOutlined,
  WalletOutlined,
  DisconnectOutlined,
} from '@ant-design/icons';
import { Modal, Card, Space, Menu, Button } from 'antd';
import HeaderDropdown from '../HeaderDropdown';
import IconFont from '@/components/IconFont';
import { FormattedMessage } from 'umi';
import { Injected, setMetamaskDisconnect } from '@/utils/utils';
import { useWallet } from '@/hooks/useWallet';
import { useWeb3React } from '@web3-react/core';
import { useModel } from '@@/plugin-model/useModel';

const Wallet: React.FC = () => {
  const [connectWalletModal, setConnectWalletModal] = useState<boolean>(false);
  const [switchNetworkTips, setSwitchNetworkTips] = useState<boolean>(true);

  const { network, connectMetamask, disconnectMetamask, account, defaultChainId, chainId, active } =
    useWallet(useWeb3React());

  const { event$ } = useModel('useWalletModel');

  useEffect(() => {
    if (account) {
      setConnectWalletModal(false);
    }
  }, [account]);

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
    async (event: { key: string; keyPath: string[] }) => {
      const { key } = event;
      if (key === 'disconnect') {
        setMetamaskDisconnect();
        await disconnectMetamask();
      }
    },
    [disconnectMetamask],
  );

  const switchNetwork = useCallback(() => {
    if (!active) return;
    Injected.getProvider().then((provider) => {
      provider.send(
        {
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${defaultChainId.toString(16)}` }],
        },
        () => {},
      );
    });
  }, [active, defaultChainId]);

  event$.useSubscription(() => {
    setConnectWalletModal(true);
  });

  return (
    <>
      {ICPDAO_ENV === 'PROD' && chainId?.toString() !== '3' && active && (
        <Modal
          visible={switchNetworkTips}
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
          onCancel={() => setSwitchNetworkTips(false)}
        >
          <div>ICPDAO is under testing, Please switch the network of metamask to Ropsten.</div>
          <Button type={'primary'} onClick={switchNetwork}>
            Switch Network
          </Button>
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
      {!active && (
        <WalletOutlined onClick={() => setConnectWalletModal(true)} className={styles.walletIcon} />
      )}
      {active && (
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
