import type { ReactNode } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import styles from './index.less';
import {
  Tabs,
  Row,
  Col,
  Form,
  InputNumber,
  Button,
  Statistic,
  Card,
  Select,
  Typography,
  Spin,
  Space,
  List,
  Descriptions,
} from 'antd';
import { FormattedMessage } from 'umi';
import { useIntl } from '@@/plugin-locale/localeExports';
import logo from '@/assets/image/logo.png';
import { BigNumber, ethers } from 'ethers';
import { useModel } from '@@/plugin-model/useModel';
import { ERC20Connect } from '@/services/ethereum-connect/erc20';
import type { Token } from '@uniswap/sdk-core';
import { formatUnits, isAddress, parseUnits } from 'ethers/lib/utils';
import { DeleteOutlined } from '@ant-design/icons';
import GlobalModal from '@/components/Modal';
import { DAOStakingAddress } from '@/services/ethereum-connect';

const { TabPane } = Tabs;

type previewBonus = {
  tokenSymbol?: string;
  tokenAddress: string;
  amount: string;
};

export default (): ReactNode => {
  const intl = useIntl();
  const { event$, isConnected, contract, accounts, network, metamaskProvider } =
    useModel('useWalletModel');
  const [icpd, setICPD] = useState<string>('');
  const [icpdApproved, setICPDApproved] = useState<boolean>(false);
  const [tokenList, setTokenList] = useState<Token[]>([]);
  const [cacheAddTokenList, setCacheAddTokenList] = useState<string[]>([]);
  const [cacheRemoveTokenList, setCacheRemoveTokenList] = useState<string[]>([]);
  const [cacheTokenList, setCacheTokenList] = useState<Token[]>([]);
  const [tokenInfoObject, setTokenInfoObject] = useState<Record<string, Token>>({});
  const [previewBonusData, setPreviewBonusData] = useState<previewBonus[]>([]);

  const [icpdBalance, setICPDBalance] = useState<BigNumber>(BigNumber.from(0));
  const [depositAmount, setDepositAmount] = useState<BigNumber>(BigNumber.from(0));
  const [depositInputValue, setDepositInputValue] = useState<BigNumber>(BigNumber.from(0));
  const [unDepositInputValue, setUnDepositInputValue] = useState<BigNumber>(BigNumber.from(0));

  const [loadingApproveButton, setLoadingApproveButton] = useState<boolean>(false);
  const [loadingStakeForm, setLoadingStakeForm] = useState<boolean>(false);
  const [loadingUnStakeForm, setLoadingUnStakeForm] = useState<boolean>(false);
  const [loadingTokenListSelect, setLoadingTokenListSelect] = useState<boolean>(false);
  const [loadingTokenList, setLoadingTokenList] = useState<boolean>(false);
  const [loadingBonusWithdrawButton, setLoadingBonusWithdrawButton] = useState<boolean>(false);
  const [loadingWithdrawButton, setLoadingWithdrawButton] = useState<boolean>(false);
  const [loadingStakeButton, setLoadingStakeButton] = useState<boolean>(false);
  const [loadingUnStakeButton, setLoadingUnStakeButton] = useState<boolean>(false);
  const [previewBonus, setPreviewBonus] = useState<boolean>(false);

  const account = useMemo(() => {
    if (accounts.length === 0) return undefined;
    return accounts[0];
  }, [accounts]);

  useMemo(async () => {
    if (!account) return;
    const userInfo = await contract.daoStaking.getUserInfo(account);
    setDepositAmount(userInfo.amount);
    const id = await contract.daoStaking.getICPD();
    setICPD(id);
    const ib: BigNumber = await contract.daoStaking.getICPDBalance(id, account);
    console.log(ethers.utils.formatUnits(ib));
    setICPDBalance(ib);
    if (!userInfo.tokens || userInfo.tokens.length <= 0) return;
    const tls: Promise<Token>[] = [];
    userInfo.tokens.forEach((t: string) => {
      const erc20Contract = new ERC20Connect(t, network, metamaskProvider);
      tls.push(erc20Contract.getToken());
    });
    const tlo: Record<string, Token> = {};
    (await Promise.all(tls)).forEach((t: Token) => {
      tlo[t.address] = t;
    });
    setTokenList(Object.values(tlo));
    setTokenInfoObject(tlo);
    console.log(userInfo, tls);
  }, [account, contract.daoStaking, metamaskProvider, network]);

  useMemo(async () => {
    if (!icpd || !account) return;
    const icpdContract = new ERC20Connect(icpd, network, metamaskProvider);
    const allowance = (await icpdContract?.getAllowance(account, DAOStakingAddress)) || 0;
    console.log({ allowance: parseInt(formatUnits(allowance), 10) });
    setICPDApproved(allowance.gt(depositInputValue));
  }, [account, depositInputValue, icpd, metamaskProvider, network]);

  const handlerApprovedICPD = useCallback(async () => {
    if (!icpd || !account) return;
    try {
      const icpdContract = new ERC20Connect(icpd, network, metamaskProvider);
      setLoadingApproveButton(true);
      const tx = await icpdContract?.approve(DAOStakingAddress);
      if (!tx) return;
      await tx.wait();
      setICPDApproved(true);
    } finally {
      setLoadingApproveButton(false);
    }
  }, [account, icpd, metamaskProvider, network]);

  const handlerMetamaskConnect = useCallback(() => {
    event$?.emit();
  }, [event$]);

  const handlerDeposit = useCallback(async () => {
    try {
      setLoadingStakeButton(true);
      const tx = await contract.daoStaking.deposit(
        depositInputValue.toString(),
        tokenList.map((t) => t.address),
      );
      setLoadingStakeButton(false);
      setLoadingStakeForm(true);
      await tx.wait();
      setLoadingStakeForm(false);
      setDepositAmount(depositAmount.add(depositInputValue));
    } catch (e) {
      setLoadingStakeButton(false);
      setLoadingStakeForm(false);
    } finally {
      setDepositInputValue(BigNumber.from(0));
    }
  }, [contract.daoStaking, depositAmount, depositInputValue, tokenList]);

  const handlerWithdraw = useCallback(async () => {
    try {
      setLoadingUnStakeButton(true);
      const tx = await contract.daoStaking.withdraw(unDepositInputValue.toString());
      setLoadingUnStakeButton(false);
      setLoadingUnStakeForm(true);
      await tx.wait();
      setLoadingUnStakeForm(false);
      setDepositAmount(depositAmount.sub(unDepositInputValue));
    } catch (e) {
      setLoadingUnStakeButton(false);
      setLoadingUnStakeForm(false);
    } finally {
      setUnDepositInputValue(BigNumber.from(0));
    }
  }, [contract.daoStaking, depositAmount, unDepositInputValue]);

  const handlerBonusWithdraw = useCallback(async () => {
    try {
      setPreviewBonus(false);
      setLoadingBonusWithdrawButton(true);

      const tx = await contract.daoStaking.bonusWithdraw(tokenList.map((t) => t.address));
      await tx.wait();
      setLoadingBonusWithdrawButton(false);
    } finally {
      setLoadingBonusWithdrawButton(false);
    }
  }, [contract.daoStaking, tokenList]);

  const handlerBonusPreview = useCallback(async () => {
    if (!account) return;
    setLoadingWithdrawButton(true);
    const { tokens, amounts } = await contract.daoStaking.getBonus(account);

    const ta: previewBonus[] = [];
    const address: string[] = [];
    const symbols: Promise<string>[] = [];

    for (let i = 0; i < tokens.length; i += 1) {
      address.push(tokens[i]);
      symbols.push(new ERC20Connect(tokens[i], network, metamaskProvider).getTokenSymbol());
    }
    (await Promise.all(symbols)).forEach((v, i) => {
      ta.push({
        amount: amounts[i],
        tokenAddress: address[i],
        tokenSymbol: v,
      });
    });

    setPreviewBonusData(ta);
    setPreviewBonus(true);
    setLoadingWithdrawButton(false);
  }, [account, contract.daoStaking, metamaskProvider, network]);

  const handlerTokenSearch = useCallback(
    async (value) => {
      if (!value) {
        return;
      }
      setLoadingTokenListSelect(true);
      if (isAddress(value)) {
        const erc20 = await new ERC20Connect(value, network, metamaskProvider).getToken();
        setCacheTokenList([erc20]);
        setTokenInfoObject((old) => ({ ...old, [value]: erc20 }));
      } else {
        setCacheTokenList([]);
      }
      setLoadingTokenListSelect(false);
    },
    [metamaskProvider, network],
  );

  const handlerAddTokenList = useCallback(async () => {
    if (cacheAddTokenList.length <= 0) return;
    try {
      setLoadingTokenList(true);
      const tx = await contract.daoStaking.addTokenList(cacheAddTokenList);
      await tx.wait();
    } finally {
      setLoadingTokenList(false);
      setCacheAddTokenList([]);
    }
  }, [cacheAddTokenList, contract.daoStaking]);

  const handlerRemoveTokenList = useCallback(async () => {
    if (cacheRemoveTokenList.length <= 0) return;
    try {
      setLoadingTokenList(true);
      const tx = await contract.daoStaking.removeTokenList(cacheRemoveTokenList);
      await tx.wait();
    } finally {
      setLoadingTokenList(false);
      setCacheRemoveTokenList([]);
    }
  }, [cacheRemoveTokenList, contract.daoStaking]);

  return (
    <>
      <PageContainer ghost header={undefined}>
        <Row>
          <Col span={14} offset={2}>
            <Row className={styles.StakingTitle}>
              <div>
                <FormattedMessage id={`pages.staking.title`} />
              </div>
            </Row>
            <Row className={styles.StakingDesc}>
              <div>
                <FormattedMessage id={`pages.staking.desc`} />
              </div>
            </Row>
            <Row className={styles.StakingTab}>
              <Tabs defaultActiveKey={'stake'} style={{ width: '80%' }}>
                <TabPane tab={<FormattedMessage id={`pages.staking.tab.stake`} />} key="stake">
                  <Spin
                    tip={intl.formatMessage({ id: 'pages.token.loading' })}
                    spinning={loadingStakeForm}
                  >
                    <Form layout={'vertical'} name={'stakeForm'}>
                      <Form.Item
                        label={intl.formatMessage({ id: 'pages.staking.input.stake' })}
                        tooltip={intl.formatMessage({ id: 'pages.staking.input.stake.desc' })}
                      >
                        <InputNumber
                          size={'large'}
                          style={{ width: '100%' }}
                          min={'0'}
                          precision={3}
                          max={formatUnits(icpdBalance)}
                          value={formatUnits(depositInputValue)}
                          onChange={(value) => setDepositInputValue(parseUnits(value.toString()))}
                        />
                        <Typography.Link onClick={() => setDepositInputValue(icpdBalance)}>
                          MAX: {formatUnits(icpdBalance)}
                        </Typography.Link>
                      </Form.Item>
                      <Form.Item>
                        {/* eslint-disable-next-line no-nested-ternary */}
                        {isConnected ? (
                          icpdApproved ? (
                            <Button
                              onClick={handlerDeposit}
                              loading={loadingStakeButton}
                              size={'large'}
                              style={{ width: '100%' }}
                              type={'primary'}
                              disabled={depositInputValue.eq(BigNumber.from(0))}
                            >
                              <FormattedMessage id={`pages.staking.button.stake`} />
                            </Button>
                          ) : (
                            <Button
                              onClick={handlerApprovedICPD}
                              loading={loadingApproveButton}
                              size={'large'}
                              style={{ width: '100%' }}
                              type={'primary'}
                            >
                              <FormattedMessage id={`pages.staking.button.approve`} />
                            </Button>
                          )
                        ) : (
                          <Button
                            type="primary"
                            size={'large'}
                            style={{ width: '100%' }}
                            onClick={() => handlerMetamaskConnect()}
                          >
                            {intl.formatMessage({
                              id: 'pages.dao.config.tab.token.create_pool.form.button.connect',
                            })}
                          </Button>
                        )}
                      </Form.Item>
                    </Form>
                  </Spin>
                </TabPane>
                <TabPane tab={<FormattedMessage id={`pages.staking.tab.un_stake`} />} key="unStake">
                  <Spin
                    tip={intl.formatMessage({ id: 'pages.token.loading' })}
                    spinning={loadingUnStakeForm}
                  >
                    <Form layout={'vertical'} name={'unStakeForm'}>
                      <Form.Item
                        label={intl.formatMessage({ id: 'pages.staking.input.un_stake' })}
                        tooltip={intl.formatMessage({ id: 'pages.staking.input.un_stake.desc' })}
                      >
                        <InputNumber
                          size={'large'}
                          style={{ width: '100%' }}
                          min={'0'}
                          precision={3}
                          max={formatUnits(depositAmount)}
                          value={formatUnits(unDepositInputValue)}
                          onChange={(value) => setUnDepositInputValue(parseUnits(value.toString()))}
                        />
                        <Typography.Link onClick={() => setUnDepositInputValue(depositAmount)}>
                          MAX: {formatUnits(depositAmount)}
                        </Typography.Link>
                      </Form.Item>
                      <Form.Item>
                        {isConnected ? (
                          <Button
                            onClick={handlerWithdraw}
                            loading={loadingUnStakeButton}
                            size={'large'}
                            style={{ width: '100%' }}
                            type={'primary'}
                            disabled={unDepositInputValue.eq(BigNumber.from(0))}
                          >
                            <FormattedMessage id={`pages.staking.button.un_stake`} />
                          </Button>
                        ) : (
                          <Button
                            type="primary"
                            size={'large'}
                            style={{ width: '100%' }}
                            onClick={() => handlerMetamaskConnect()}
                          >
                            {intl.formatMessage({
                              id: 'pages.dao.config.tab.token.create_pool.form.button.connect',
                            })}
                          </Button>
                        )}
                      </Form.Item>
                    </Form>
                  </Spin>
                </TabPane>
              </Tabs>
            </Row>
          </Col>
          <Col span={6}>
            <Row style={{ maxWidth: 350 }}>
              <img src={logo} alt="" width={'100%'} />
            </Row>
            <Row className={styles.StakingWithdrawButton}>
              <Button
                onClick={handlerBonusPreview}
                loading={loadingWithdrawButton}
                size={'large'}
                type={'primary'}
                style={{ width: '100%' }}
              >
                <FormattedMessage id={`pages.staking.button.withdraw`} />
              </Button>
            </Row>
            <Row>
              <Card className={styles.StakingBalanceCard}>
                <Statistic
                  title={intl.formatMessage({ id: 'pages.staking.balance' })}
                  value={formatUnits(depositAmount)}
                  precision={3}
                />
              </Card>
            </Row>
            <Row>
              <Form layout={'vertical'} style={{ width: '100%' }} name={'tokenListForm'}>
                <Spin
                  tip={intl.formatMessage({ id: 'pages.token.loading' })}
                  spinning={loadingTokenList}
                >
                  <Form.Item>
                    <List
                      header={
                        <div>{intl.formatMessage({ id: 'pages.staking.select.token_list' })}</div>
                      }
                      bordered
                      size={'small'}
                      locale={{ emptyText: 'empty' }}
                      itemLayout="horizontal"
                      dataSource={tokenList}
                      renderItem={(item) => (
                        <List.Item
                          actions={[
                            <Button
                              disabled={cacheAddTokenList.length > 0}
                              type={'link'}
                              onClick={() => {
                                setCacheRemoveTokenList(
                                  cacheRemoveTokenList.concat([item.address]),
                                );
                                setTokenList(tokenList.filter((c) => c.address !== item.address));
                              }}
                            >
                              <DeleteOutlined />
                            </Button>,
                          ]}
                        >
                          {item.symbol}
                        </List.Item>
                      )}
                      pagination={{
                        pageSize: 3,
                      }}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Select
                      size={'large'}
                      loading={loadingTokenListSelect}
                      showArrow={false}
                      showSearch
                      disabled={cacheRemoveTokenList.length > 0}
                      style={{ width: '100%' }}
                      filterOption={false}
                      onSearch={handlerTokenSearch}
                      value={''}
                      onChange={(value: string) => {
                        console.log(value);
                        setCacheTokenList([]);
                        if (tokenList.map((t) => t.address).includes(value)) return;
                        setTokenList(tokenList.concat([tokenInfoObject[value]]));
                        setCacheAddTokenList(cacheAddTokenList.concat([value]));
                      }}
                    >
                      {cacheTokenList.map((t) => (
                        <Select.Option key={t.address} value={t.address} tokensymbol={t.symbol}>
                          <Space>
                            <Space size={0} direction={'vertical'}>
                              <div className={styles.quoteTokenSelectOptionSymbol}>{t.symbol}</div>
                              <div className={styles.quoteTokenSelectOptionName}>{t.name}</div>
                            </Space>
                          </Space>
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item>
                    {cacheAddTokenList.length > 0 && (
                      <Button type={'primary'} onClick={handlerAddTokenList}>
                        Add Token
                      </Button>
                    )}
                    {cacheRemoveTokenList.length > 0 && (
                      <Button type={'primary'} onClick={handlerRemoveTokenList}>
                        Remove Token
                      </Button>
                    )}
                  </Form.Item>
                </Spin>
              </Form>
            </Row>
          </Col>
        </Row>
      </PageContainer>
      <GlobalModal
        key={'previewBonus'}
        visible={previewBonus}
        onOk={async () => {
          await handlerBonusWithdraw();
          return true;
        }}
        confirmLoading={loadingBonusWithdrawButton}
        width={800}
        okText={intl.formatMessage({ id: 'pages.dao.config.tab.token.create.modal.ok' })}
        cancelText={intl.formatMessage({ id: 'pages.dao.config.tab.token.create.modal.cancel' })}
        onCancel={() => setPreviewBonus(false)}
      >
        <Descriptions title="Preview Bonus" bordered column={1}>
          {previewBonusData.map((d) => {
            return <Descriptions.Item label={d.tokenSymbol}>{d.amount}</Descriptions.Item>;
          })}
        </Descriptions>
      </GlobalModal>
    </>
  );
};
