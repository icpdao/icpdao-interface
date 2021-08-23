import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { TokenConfigComponentsProps } from '@/pages/Dao/components/TokenConfig';
import { useIntl, FormattedMessage } from 'umi';
import type { CycleQuery } from '@/services/dao/generated';
import { useCyclesByTokenUnreleasedListLazyQuery } from '@/services/dao/generated';
import { ZeroAddress } from '@/services/ethereum-connect';
import { DAOTokenConnect } from '@/services/ethereum-connect/token';
import { useModel } from '@@/plugin-model/useModel';
import { PageLoading } from '@ant-design/pro-layout';
import {
  Alert,
  Avatar,
  Button,
  Form,
  InputNumber,
  Row,
  Select,
  Space,
  Spin,
  Switch,
  Table,
} from 'antd';
import { getFormatTimeByZone, getTimestampByZone } from '@/utils/utils';
import GlobalModal from '@/components/Modal';
import { LinkOutlined, UserOutlined } from '@ant-design/icons';
import type { ETH_CONNECT } from '@/services/ethereum-connect/typings';

type previewMintData = {
  uid: string;
  address: string;
  githubLogin: string;
  nickname: string;
  size: number;
  jobSize: number;
};

const previewTableColumns = [
  {
    title: <FormattedMessage id="pages.dao.config.tab.token.mint.preview.table.column.name" />,
    dataIndex: 'name',
    render: (_: any, record: previewMintData) => (
      <Space size="middle">
        <Avatar size="small" icon={<UserOutlined />} />
        <span>
          <a>{record.nickname}</a>
        </span>
      </Space>
    ),
  },
  {
    title: <FormattedMessage id="pages.dao.config.tab.token.mint.preview.table.column.address" />,
    dataIndex: 'address',
  },
  {
    title: <FormattedMessage id="pages.dao.config.tab.token.mint.preview.table.column.size" />,
    dataIndex: 'size',
  },
];

const TokenMint: React.FC<TokenConfigComponentsProps> = ({ tokenAddress, setCurrentTab }) => {
  const intl = useIntl();

  const [cycles, setCycles] = useState<Record<string, CycleQuery>>({});
  const [selectCycles, setSelectCycles] = useState<CycleQuery[]>([]);
  const [currentSelectCycle, setCurrentSelectCycle] = useState<string>('');
  const [previewMintData, setPreviewMintData] = useState<previewMintData[]>([]);
  const [previewMintBeginTime, setPreviewMintBeginTime] = useState<number[]>([0, 0]);
  const [previewMintEndTime, setPreviewMintEndTime] = useState<number[]>([0, 0]);
  const [advancedOP, setAdvancedOP] = useState<boolean>(false);
  const [previewMint, setPreviewMint] = useState<boolean>(false);
  const [mintButtonLoading, setMintButtonLoading] = useState<boolean>(false);

  const [lpPoolAddress, setLPPoolAddress] = useState<string>('');

  const [loadingTransferComplete, setLoadingTransferComplete] = useState<boolean>(false);

  const {
    metamaskEvent$,
    metamaskIsConnected,
    network,
    metamaskProvider,
    formData,
    setFormDataFast,
    minPrice,
    maxPrice,
    minPriceChange,
    maxPriceChange,
    position,
    contract,
    setPoolInfo,
  } = useModel('useUniswapModel');

  const tokenContract = useMemo(() => {
    if (tokenAddress && tokenAddress !== ZeroAddress) {
      return new DAOTokenConnect(tokenAddress, network, metamaskProvider);
    }
    return undefined;
  }, [metamaskProvider, network, tokenAddress]);

  const [queryCyclesByTokenUnreleasedList, cyclesByTokenUnreleasedListResult] =
    useCyclesByTokenUnreleasedListLazyQuery({ fetchPolicy: 'no-cache' });

  useMemo(async () => {
    if (!tokenContract) return;
    const anchor = await tokenContract.getMintAnchor();
    console.log(anchor);
    setLPPoolAddress(await tokenContract.getLPPool());
    queryCyclesByTokenUnreleasedList({
      variables: { lastTimestamp: anchor.lastTimestamp.toString() },
    });
  }, [queryCyclesByTokenUnreleasedList, tokenContract]);

  useMemo(() => {
    const unreleasedCycle: Record<string, CycleQuery> = {};
    cyclesByTokenUnreleasedListResult.data?.cyclesByTokenUnreleased?.nodes?.forEach((d) => {
      if (!d?.datum?.id) return;
      unreleasedCycle[d.datum.id] = d as CycleQuery;
    });
    setCycles(unreleasedCycle);
    setSelectCycles(Object.values(unreleasedCycle));
  }, [cyclesByTokenUnreleasedListResult.data?.cyclesByTokenUnreleased?.nodes]);

  useMemo(async () => {
    if (!lpPoolAddress || lpPoolAddress === ZeroAddress || !tokenAddress) return;
    const pool = await contract.uniswapPool.getPoolByAddress(lpPoolAddress, tokenAddress);
    setPoolInfo(pool);
    setFormDataFast({
      fee: pool.pool?.fee,
      baseToken: pool.tokenA?.address === tokenAddress ? pool.tokenA : pool.tokenB,
      quoteToken: pool.tokenA?.address === tokenAddress ? pool.tokenB : pool.tokenA,
      baseTokenAmount: 0,
      quoteTokenAmount: 0,
    });
  }, [contract.uniswapPool, lpPoolAddress, setFormDataFast, setPoolInfo, tokenAddress]);

  useEffect(() => {
    if (!formData.startingPrice) return;
    setFormDataFast({ minPrice: formData.startingPrice.toString() });
  }, [formData, setFormDataFast]);

  const handlerMetamaskConnect = useCallback(() => {
    metamaskEvent$?.emit();
  }, [metamaskEvent$]);

  const handlerPreviewMint = useCallback(() => {
    if (!currentSelectCycle) return;
    setPreviewMint(true);
    const pd: Record<string, previewMintData> = {};
    setPreviewMintBeginTime([
      selectCycles[0]?.datum?.beginAt || 0,
      selectCycles[0]?.datum?.timeZone || 0,
    ]);
    for (let i = 0; i < selectCycles.length; i += 1) {
      selectCycles[i].icpperStats?.nodes?.forEach((is) => {
        const uid = is?.icpper?.id;
        if (!uid) return;
        if (uid && pd.uid) {
          pd.uid.size += is?.datum?.size || 0;
          pd.uid.jobSize += is?.datum?.jobSize || 0;
        } else {
          pd.uid = {
            address: is?.icpper?.erc20Address || '',
            nickname: is?.icpper?.nickname || '',
            githubLogin: is?.icpper?.githubLogin || '',
            size: is?.datum?.size || 0,
            jobSize: is?.datum?.jobSize || 0,
            uid,
          };
        }
      });
      if (selectCycles[i].datum?.id === currentSelectCycle) {
        setPreviewMintEndTime([
          selectCycles[i].datum?.endAt || 0,
          selectCycles[i].datum?.timeZone || 0,
        ]);
        break;
      }
    }
    setPreviewMintData(Object.values(pd));
  }, [currentSelectCycle, selectCycles]);

  const handlerMint = useCallback(async () => {
    if (!position || !tokenContract) return;
    try {
      setMintButtonLoading(true);
      const mintBody: ETH_CONNECT.Mint = {
        mintTokenAddressList: previewMintData.map((pd) => pd.address),
        mintTokenAmountRatioList: previewMintData.map((pd) => pd.size * 100),
        endTimestamp: getTimestampByZone(previewMintEndTime[0], previewMintEndTime[1]),
        tickLower: position.tickLower,
        tickUpper: position.tickUpper,
      };
      const tx = await tokenContract.mint(mintBody);
      setMintButtonLoading(false);
      setPreviewMint(false);
      setLoadingTransferComplete(true);
      await tx.wait();
      setLoadingTransferComplete(false);
    } catch (e) {
      setMintButtonLoading(false);
      setLoadingTransferComplete(false);
    }
  }, [position, previewMintData, previewMintEndTime, tokenContract]);

  if (
    cyclesByTokenUnreleasedListResult.loading ||
    cyclesByTokenUnreleasedListResult.error ||
    cyclesByTokenUnreleasedListResult.data?.cyclesByTokenUnreleased === undefined
  ) {
    return <PageLoading />;
  }

  if (lpPoolAddress === ZeroAddress) {
    return (
      <>
        <Alert
          message="Warning"
          description={
            <div>
              {intl.formatMessage({ id: 'pages.dao.config.tab.token.add_lp.notfound' })}
              <LinkOutlined
                onClick={() => {
                  if (setCurrentTab) setCurrentTab('create');
                }}
              />
            </div>
          }
          type="warning"
          showIcon
        />
      </>
    );
  }

  return (
    <>
      <Spin
        tip={intl.formatMessage({ id: 'pages.token.loading' })}
        spinning={loadingTransferComplete}
      >
        <Form layout={'vertical'} name={'tokenMintForm'} wrapperCol={{ span: 16 }}>
          <Form.Item
            label={intl.formatMessage({ id: 'pages.dao.config.tab.token.mint.form.end_cycle' })}
            tooltip={intl.formatMessage({
              id: 'pages.dao.config.tab.token.mint.form.end_cycle.desc',
            })}
          >
            <Select onChange={(v: string) => setCurrentSelectCycle(v)} style={{ width: 450 }}>
              {Object.values(cycles).map((c) => {
                return (
                  <Select.Option value={c.datum?.id || ''}>
                    {getFormatTimeByZone(c?.datum?.beginAt || 0, c?.datum?.timeZone || 0, 'LL')} -{' '}
                    {getFormatTimeByZone(c?.datum?.endAt || 0, c?.datum?.timeZone || 0, 'LL')}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
          <Form.Item>
            <Switch
              checked={advancedOP}
              onChange={(value) => {
                setAdvancedOP(value);
                console.log({ sp: formData.startingPrice?.toString() });
                setFormDataFast({
                  minPrice: formData.startingPrice?.toString() || true,
                  maxPrice: true,
                });
              }}
              disabled={!formData.startingPrice}
              checkedChildren={intl.formatMessage({
                id: 'pages.dao.config.tab.token.mint.form.advanced',
              })}
              unCheckedChildren=""
            />
          </Form.Item>
          {advancedOP && (
            <Row>
              <Space>
                <Form.Item
                  label={intl.formatMessage({
                    id: 'pages.dao.config.tab.token.mint.form.min_price',
                  })}
                  tooltip={intl.formatMessage({
                    id: 'pages.dao.config.tab.token.mint.form.min_price.desc',
                  })}
                >
                  <InputNumber
                    style={{ width: '200px' }}
                    value={minPrice}
                    min={formData.startingPrice}
                    onChange={(value) => {
                      setFormDataFast({
                        minPrice: value?.toString() || formData.startingPrice?.toString() || true,
                      });
                    }}
                    onStep={(_, info) => {
                      setFormDataFast({ minPrice: minPriceChange(info) });
                    }}
                  />
                </Form.Item>
                <Form.Item
                  label={intl.formatMessage({
                    id: 'pages.dao.config.tab.token.mint.form.max_price',
                  })}
                  tooltip={intl.formatMessage({
                    id: 'pages.dao.config.tab.token.mint.form.max_price.desc',
                  })}
                >
                  <InputNumber
                    style={{ width: '200px' }}
                    value={maxPrice}
                    min={formData.startingPrice}
                    onChange={(value) => {
                      setFormDataFast({ maxPrice: value?.toString() || true });
                    }}
                    onStep={(_, info) => {
                      setFormDataFast({ maxPrice: maxPriceChange(info) });
                    }}
                  />
                </Form.Item>
              </Space>
            </Row>
          )}
          <Form.Item>
            {metamaskIsConnected && !!formData.quoteToken && !!formData.fee && (
              <Button type="primary" disabled={!currentSelectCycle} onClick={handlerPreviewMint}>
                {intl.formatMessage({ id: 'pages.dao.config.tab.token.mint.form.button.submit' })}
              </Button>
            )}
            {!metamaskIsConnected && (
              <Button type="primary" onClick={() => handlerMetamaskConnect()}>
                {intl.formatMessage({
                  id: 'pages.dao.config.tab.token.create_pool.form.button.connect',
                })}
              </Button>
            )}
          </Form.Item>
        </Form>
      </Spin>
      <GlobalModal
        key={'previewCreateLP'}
        visible={previewMint}
        onOk={handlerMint}
        confirmLoading={mintButtonLoading}
        width={800}
        okText={intl.formatMessage({ id: 'pages.dao.config.tab.token.create.modal.ok' })}
        cancelText={intl.formatMessage({ id: 'pages.dao.config.tab.token.create.modal.cancel' })}
        onCancel={() => setPreviewMint(false)}
      >
        <Table
          columns={previewTableColumns}
          dataSource={previewMintData}
          rowKey={'uid'}
          pagination={false}
          scroll={{ x: 500, y: 500 }}
          bordered
          summary={(pageData) => {
            let totalSize = 0;
            pageData.forEach(({ size }) => {
              totalSize += size;
            });
            return (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0}>
                    {intl.formatMessage({
                      id: 'pages.dao.config.tab.token.mint.preview.table.total',
                    })}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} colSpan={2}>
                    {totalSize}
                  </Table.Summary.Cell>
                </Table.Summary.Row>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0}>
                    {intl.formatMessage({
                      id: 'pages.dao.config.tab.token.mint.preview.table.range_time',
                    })}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} colSpan={2}>
                    {getFormatTimeByZone(previewMintBeginTime[0], previewMintBeginTime[1], 'LL')} -{' '}
                    {getFormatTimeByZone(previewMintEndTime[0], previewMintEndTime[1], 'LL')}
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            );
          }}
        />
      </GlobalModal>
    </>
  );
};

export default TokenMint;
