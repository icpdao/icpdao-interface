import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { TokenConfigComponentsProps } from '@/pages/Dao/components/TokenConfig';
import { useIntl, FormattedMessage } from 'umi';
import type { CycleQuery, SplitInfo, TokenMintRecordQuery } from '@/services/dao/generated';
import {
  useCreateTokenMintMutation,
  useCyclesByTokenUnreleasedListLazyQuery,
  useDaoTokenMintDropLazyQuery,
  useDaoTokenMintRecordsLazyQuery,
  useDaoTokenMintRunningLazyQuery,
  useDaoTokenMintSplitInfoLazyQuery,
  useDropMintRecordMutation,
  useFindLostTxForDropTokenMintRecordMutation,
  useFindLostTxForInitTokenMintRecordMutation,
  useLinkTxHashMutation,
  useSyncTokenMintRecordEventMutation,
} from '@/services/dao/generated';
import { ZeroAddress } from '@/services/ethereum-connect';
import { DAOTokenConnect } from '@/services/ethereum-connect/token';
import { useModel } from '@@/plugin-model/useModel';
import { PageLoading } from '@ant-design/pro-layout';
import {
  Alert,
  Avatar,
  Button,
  Form,
  Input,
  InputNumber,
  message,
  Popconfirm,
  Popover,
  Row,
  Select,
  Space,
  Spin,
  Switch,
  Table,
  Tag,
  Tooltip,
} from 'antd';
import {
  clearCacheMintRecordBingTxHash,
  EthereumChainId,
  getCacheMintRecordBindTxHash,
  getFormatTime,
  getFormatTimeByZone,
  getTimestampByZone,
  setCacheMintRecordBindTxHash,
} from '@/utils/utils';
import GlobalModal from '@/components/Modal';
import { LinkOutlined, UserOutlined } from '@ant-design/icons';
import type { ETH_CONNECT } from '@/services/ethereum-connect/typings';

const previewTableColumns = [
  {
    title: <FormattedMessage id="pages.dao.config.tab.token.mint.preview.table.column.name" />,
    dataIndex: 'userNickname',
    render: (_: any, record: SplitInfo) => (
      <Space size="middle">
        <Avatar size="small" icon={<UserOutlined />} />
        <span>
          <a>{record.userNickname}</a>
        </span>
      </Space>
    ),
  },
  {
    title: <FormattedMessage id="pages.dao.config.tab.token.mint.preview.table.column.address" />,
    dataIndex: 'userErc20Address',
    render: (_: any, record: SplitInfo) => {
      if (record.userErc20Address) return <span>{record.userErc20Address}</span>;
      return (
        <Tooltip
          title={
            <FormattedMessage id="pages.dao.config.tab.token.mint.preview.table.column.no_address_tips" />
          }
          placement={'right'}
        >
          <Tag color="red">warning !!!</Tag>
        </Tooltip>
      );
    },
  },
  {
    title: <FormattedMessage id="pages.dao.config.tab.token.mint.preview.table.column.ratio" />,
    dataIndex: 'ratio',
  },
];

const TokenMint: React.FC<TokenConfigComponentsProps> = ({
  tokenAddress,
  setCurrentTab,
  daoId,
}) => {
  const intl = useIntl();

  const [cycles, setCycles] = useState<Record<string, CycleQuery>>({});
  const [selectCycles, setSelectCycles] = useState<CycleQuery[]>([]);
  const [currentSelectCycle, setCurrentSelectCycle] = useState<string>('');
  const [previewMintBeginTime, setPreviewMintBeginTime] = useState<number[]>([0, 0]);
  const [previewMintEndTime, setPreviewMintEndTime] = useState<number[]>([0, 0]);
  const [advancedOP, setAdvancedOP] = useState<boolean>(false);
  const [previewMint, setPreviewMint] = useState<boolean>(false);
  const [mintRecordModal, setMintRecordModal] = useState<boolean>(false);
  const [mintButtonLoading, setMintButtonLoading] = useState<boolean>(false);
  const [currentMintBody, setCurrentMintBody] = useState<ETH_CONNECT.Mint>();

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

  const [queryDaoTokenMintRunning, daoTokenMintRunningResult] = useDaoTokenMintRunningLazyQuery({
    fetchPolicy: 'no-cache',
  });

  const [queryCyclesByTokenUnreleasedList, cyclesByTokenUnreleasedListResult] =
    useCyclesByTokenUnreleasedListLazyQuery({ fetchPolicy: 'no-cache' });

  const [queryDaoTokenMintSplitInfo, daoTokenMintSplitInfoResult] =
    useDaoTokenMintSplitInfoLazyQuery({ fetchPolicy: 'no-cache' });

  const [queryDaoTokenMintRecords, daoTokenMintRecordsResult] = useDaoTokenMintRecordsLazyQuery();
  const [queryDaoTokenMintDrop, daoTokenMintDropResult] = useDaoTokenMintDropLazyQuery();

  const [mutationCreateTokenMintMutation, createTokenMintMutationResult] =
    useCreateTokenMintMutation();
  const [mutationFindLostTxForDropTokenMintRecord] = useFindLostTxForDropTokenMintRecordMutation();
  const [mutationLinkTxHash, linkTxHashResult] = useLinkTxHashMutation();
  const [mutationDropMintRecord, dropMintRecordResult] = useDropMintRecordMutation();
  const [mutationSyncTokenMintRecordEvent] = useSyncTokenMintRecordEventMutation();
  const [mutationFindLostTxForInitTokenMintRecord, findLostTxForInitTokenMintRecordResult] =
    useFindLostTxForInitTokenMintRecordMutation();
  const [anchor, setAnchor] = useState<any>();

  useEffect(() => {
    const { recordId, txHash } = getCacheMintRecordBindTxHash();
    if (recordId) {
      mutationLinkTxHash({ variables: { recordId, mintTxHash: txHash } }).then(() =>
        clearCacheMintRecordBingTxHash(),
      );
    }
  }, [mutationLinkTxHash]);

  useEffect(() => {
    if (!daoId || !tokenAddress || tokenAddress === ZeroAddress) return;
    queryDaoTokenMintRunning({
      variables: { daoId, tokenContractAddress: tokenAddress, chainId: EthereumChainId[network] },
    });
    queryDaoTokenMintDrop({
      variables: { daoId, tokenContractAddress: tokenAddress, chainId: EthereumChainId[network] },
    });
  }, [daoId, network, queryDaoTokenMintDrop, queryDaoTokenMintRunning, tokenAddress]);

  useEffect(() => {
    if (
      !daoId ||
      !tokenAddress ||
      tokenAddress === ZeroAddress ||
      daoTokenMintDropResult.loading ||
      daoTokenMintDropResult.error ||
      !daoTokenMintDropResult.data
    )
      return;
    if (
      daoTokenMintDropResult.data.dao?.tokenMintRecords?.nodes &&
      daoTokenMintDropResult.data.dao?.tokenMintRecords?.nodes?.length > 0
    ) {
      mutationFindLostTxForDropTokenMintRecord({
        variables: { daoId, tokenContractAddress: tokenAddress, chainId: EthereumChainId[network] },
      });
    }
  }, [
    daoId,
    daoTokenMintDropResult.data,
    daoTokenMintDropResult.data?.dao?.tokenMintRecords?.nodes,
    daoTokenMintDropResult.error,
    daoTokenMintDropResult.loading,
    mutationFindLostTxForDropTokenMintRecord,
    network,
    tokenAddress,
  ]);

  useEffect(() => {
    if (
      !daoTokenMintRunningResult.data?.dao?.tokenMintRecords?.nodes ||
      daoTokenMintRunningResult.data?.dao?.tokenMintRecords?.nodes?.length === 0
    ) {
      setLoadingTransferComplete(false);
      return;
    }
    if (daoTokenMintRunningResult.data?.dao?.tokenMintRecords?.nodes?.length > 0) {
      daoTokenMintRunningResult.data?.dao?.tokenMintRecords?.nodes?.forEach((r) => {
        if (r?.datum?.status === 1)
          mutationSyncTokenMintRecordEvent({ variables: { recordId: r?.datum?.id || '' } });
      });
      setLoadingTransferComplete(true);
    }
  }, [
    daoTokenMintRunningResult.data?.dao?.tokenMintRecords?.nodes,
    mutationSyncTokenMintRecordEvent,
  ]);

  useEffect(() => {
    if (!tokenContract || !daoId) return;
    tokenContract.getMintAnchor().then((anc) => {
      console.log(anc);
      setAnchor(anc);
      tokenContract.getLPPool().then((value) => setLPPoolAddress(value));
      queryCyclesByTokenUnreleasedList({
        variables: { daoId, lastTimestamp: anc.lastTimestamp.toString() },
      });
    });
  }, [daoId, queryCyclesByTokenUnreleasedList, tokenContract]);

  useEffect(() => {
    const unreleasedCycle: Record<string, CycleQuery> = {};
    cyclesByTokenUnreleasedListResult.data?.cyclesByTokenUnreleased?.nodes?.forEach((d) => {
      if (!d?.datum?.id) return;
      unreleasedCycle[d.datum.id] = d as CycleQuery;
    });
    setCycles(unreleasedCycle);
    setSelectCycles(
      Object.values(unreleasedCycle).sort(
        (a, b) => (a.datum?.beginAt || 0) - (b.datum?.beginAt || 0),
      ),
    );
  }, [cyclesByTokenUnreleasedListResult.data?.cyclesByTokenUnreleased?.nodes]);

  useEffect(() => {
    if (!lpPoolAddress || lpPoolAddress === ZeroAddress || !tokenAddress) return;
    contract.uniswapPool.getPoolByAddress(lpPoolAddress, tokenAddress).then((pool) => {
      setPoolInfo(pool);
      setFormDataFast({
        fee: pool.pool?.fee,
        baseToken: pool.tokenA?.address === tokenAddress ? pool.tokenA : pool.tokenB,
        quoteToken: pool.tokenA?.address === tokenAddress ? pool.tokenB : pool.tokenA,
        baseTokenAmount: 0,
        quoteTokenAmount: 0,
      });
    });
  }, [contract.uniswapPool, lpPoolAddress, setFormDataFast, setPoolInfo, tokenAddress]);

  useEffect(() => {
    if (!formData.startingPrice) return;
    setFormDataFast({ minPrice: formData.startingPrice.toString() });
  }, [formData.startingPrice, setFormDataFast]);

  const handlerMetamaskConnect = useCallback(() => {
    metamaskEvent$?.emit();
  }, [metamaskEvent$]);

  const handlerPreviewMint = useCallback(() => {
    if (!daoId || !currentSelectCycle || selectCycles.length === 0 || !selectCycles[0].datum?.id)
      return;
    queryDaoTokenMintSplitInfo({
      variables: { daoId, startCycleId: selectCycles[0].datum.id, endCycleId: currentSelectCycle },
    });
    setPreviewMintBeginTime([
      selectCycles[0]?.datum?.beginAt || 0,
      selectCycles[0]?.datum?.timeZone || 0,
    ]);
    setPreviewMintEndTime([
      cycles[currentSelectCycle].datum?.endAt || 0,
      cycles[currentSelectCycle].datum?.timeZone || 0,
    ]);
    setPreviewMint(true);
  }, [currentSelectCycle, cycles, daoId, queryDaoTokenMintSplitInfo, selectCycles]);

  const handlerMint = useCallback(async () => {
    if (
      !tokenContract ||
      !daoId ||
      !anchor ||
      !daoTokenMintSplitInfoResult.data?.dao?.tokenMintSplitInfo?.splitInfos
    )
      return;
    try {
      setMintButtonLoading(true);
      const splitInfos =
        daoTokenMintSplitInfoResult.data?.dao?.tokenMintSplitInfo?.splitInfos.filter(
          (pd) =>
            pd?.userErc20Address &&
            pd.userErc20Address !== '' &&
            pd.userErc20Address !== ZeroAddress,
        );
      const mintBody: ETH_CONNECT.Mint = {
        mintTokenAddressList: splitInfos.map((pd) => pd?.userErc20Address || ''),
        mintTokenAmountRatioList: splitInfos.map((pd) => pd?.ratio || 0),
        startTimestamp: anchor.lastTimestamp.toNumber(),
        endTimestamp: getTimestampByZone(previewMintEndTime[0], previewMintEndTime[1]),
        tickLower: position?.tickLower || 0,
        tickUpper: position?.tickUpper || 0,
      };
      setCurrentMintBody(mintBody);
      await mutationCreateTokenMintMutation({
        variables: {
          daoId,
          startCycleId: selectCycles[0].datum?.id || '',
          endCycleId: currentSelectCycle,
          tokenContractAddress: tokenAddress || '',
          startTimestamp: mintBody.startTimestamp,
          endTimestamp: mintBody.endTimestamp,
          tickLower: mintBody.tickLower,
          tickUpper: mintBody.tickUpper,
          chainId: EthereumChainId[network].toString(),
        },
      });
      console.log({ createTokenMintMutationResult });
    } catch (e) {
      setMintButtonLoading(false);
      setLoadingTransferComplete(false);
    }
  }, [
    anchor,
    createTokenMintMutationResult,
    currentSelectCycle,
    daoId,
    daoTokenMintSplitInfoResult.data?.dao?.tokenMintSplitInfo?.splitInfos,
    mutationCreateTokenMintMutation,
    network,
    position?.tickLower,
    position?.tickUpper,
    previewMintEndTime,
    selectCycles,
    tokenAddress,
    tokenContract,
  ]);

  useEffect(() => {
    if (!tokenContract || !currentMintBody || createTokenMintMutationResult.loading) return;
    const mintRecordId =
      createTokenMintMutationResult.data?.createTokenMintRecord?.tokenMintRecord?.id;
    if (mintRecordId) {
      tokenContract
        .mint(currentMintBody)
        .then((tx) => {
          console.log(tx);
          setMintButtonLoading(false);
          setPreviewMint(false);
          setCacheMintRecordBindTxHash(mintRecordId, tx.hash);
          mutationLinkTxHash({ variables: { recordId: mintRecordId, mintTxHash: tx.hash } }).then(
            () => {
              setLoadingTransferComplete(true);
              clearCacheMintRecordBingTxHash();
              tx.wait().then((receipt: any) => {
                console.log(receipt);
                setLoadingTransferComplete(false);
              });
            },
          );
        })
        .catch(() => {
          mutationDropMintRecord({ variables: { recordId: mintRecordId } });
          setMintButtonLoading(false);
          setLoadingTransferComplete(false);
        });
    } else {
      message.warn(
        intl.formatMessage({ id: 'pages.dao.config.tab.token.mint.create_record.failed' }),
      );
    }
  }, [
    createTokenMintMutationResult.data?.createTokenMintRecord?.tokenMintRecord?.id,
    createTokenMintMutationResult.loading,
    currentMintBody,
    intl,
    mutationDropMintRecord,
    mutationLinkTxHash,
    tokenContract,
  ]);

  const [manuallyBindInputValue, setManuallyBindInputValue] = useState<Record<string, string>>({});

  const manuallyBind = useCallback(
    (recordId: string) => {
      return (
        <div style={{ width: '630px', height: '65px' }}>
          <div>
            <Input
              size={'small'}
              onChange={(v) =>
                setManuallyBindInputValue((old) => ({ ...old, [recordId]: v.target.value }))
              }
              placeholder={intl.formatMessage({
                id: 'pages.dao.config.tab.token.mint.records.table.column.operation.bind_tx.input_pla',
              })}
            />
          </div>
          <div style={{ marginTop: 15, float: 'right' }}>
            <Button
              disabled={!manuallyBindInputValue[recordId]}
              size={'small'}
              type={'primary'}
              onClick={async () => {
                await mutationLinkTxHash({
                  variables: { recordId, mintTxHash: manuallyBindInputValue[recordId] },
                });
                setManuallyBindInputValue((old) => ({ ...old, [recordId]: '' }));
                setMintRecordModal(false);
                if (daoTokenMintRunningResult && daoTokenMintRunningResult.refetch)
                  await daoTokenMintRunningResult.refetch();
              }}
            >
              {intl.formatMessage({
                id: 'pages.dao.config.tab.token.mint.records.table.column.operation.bind_tx.save',
              })}
            </Button>
          </div>
        </div>
      );
    },
    [daoTokenMintRunningResult, intl, manuallyBindInputValue, mutationLinkTxHash],
  );

  const handlerOpenMintRecordView = useCallback(() => {
    if (!daoId || !tokenAddress) return;
    queryDaoTokenMintRecords({
      variables: {
        daoId,
        tokenContractAddress: tokenAddress,
        chainId: EthereumChainId[network],
        first: 100,
        offset: 0,
      },
    });
    setMintRecordModal(true);
  }, [daoId, network, queryDaoTokenMintRecords, tokenAddress]);

  const handlerRefreshInitMintRecord = useCallback(
    async (record: TokenMintRecordQuery) => {
      // MAYBE: check history auto bind tx_hash
      await mutationFindLostTxForInitTokenMintRecord({
        variables: { recordId: record.datum?.id || '' },
      });
    },
    [mutationFindLostTxForInitTokenMintRecord],
  );

  const mintRecordColumns = useMemo(() => {
    return [
      {
        title: (
          <FormattedMessage id="pages.dao.config.tab.token.mint.records.table.column.status" />
        ),
        dataIndex: ['datum', 'status'],
        render: (_: any, record: TokenMintRecordQuery) => {
          switch (record.datum?.status) {
            case 0:
              return <Tag color="purple">INIT</Tag>;
            case 1:
              return <Tag color="cyan">PENDING</Tag>;
            case 2:
              return <Tag color="green">SUCCESS</Tag>;
            case 3:
              return <Tag color="red">FAIL</Tag>;
            case 100:
              return <Tag color="purple">DELETED</Tag>;
            default:
              return <Tag color="red">FAIL</Tag>;
          }
        },
      },
      {
        title: (
          <FormattedMessage id="pages.dao.config.tab.token.mint.records.table.column.create_at" />
        ),
        dataIndex: ['datum', 'createAt'],
        render: (_: any, record: TokenMintRecordQuery) => {
          if (record.datum?.status !== 0)
            return {
              children: <>{getFormatTime(record?.datum?.createAt || 0, 'LL')}</>,
              props: { colSpan: 2 },
            };
          return <>{getFormatTime(record?.datum?.createAt || 0, 'LL')}</>;
        },
      },
      {
        title: (
          <FormattedMessage id="pages.dao.config.tab.token.mint.records.table.column.operation" />
        ),
        key: 'operation',
        render: (_: any, record: TokenMintRecordQuery) => {
          if (record.datum?.status !== 0)
            return {
              children: <></>,
              props: { colSpan: 0 },
            };
          return (
            <Space size={'small'} direction={'vertical'}>
              {!findLostTxForInitTokenMintRecordResult.data ? (
                <Button
                  onClick={() => handlerRefreshInitMintRecord(record)}
                  loading={findLostTxForInitTokenMintRecordResult.loading || false}
                  type={'primary'}
                >
                  {intl.formatMessage({
                    id: 'pages.dao.config.tab.token.mint.records.table.column.operation.refresh',
                  })}
                </Button>
              ) : (
                <>
                  <Popover content={manuallyBind(record?.datum?.id || '')} trigger="click">
                    <Button loading={linkTxHashResult.loading || false} type={'primary'}>
                      {intl.formatMessage({
                        id: 'pages.dao.config.tab.token.mint.records.table.column.operation.bind_tx',
                      })}
                    </Button>
                  </Popover>

                  <Popconfirm
                    title="Are you sure？"
                    okText="Yes"
                    cancelText="No"
                    onConfirm={async () => {
                      await mutationDropMintRecord({
                        variables: { recordId: record.datum?.id || '' },
                      });
                      setMintRecordModal(false);
                      if (daoTokenMintRunningResult && daoTokenMintRunningResult.refetch)
                        await daoTokenMintRunningResult.refetch();
                    }}
                  >
                    <Button loading={dropMintRecordResult.loading || false}>
                      {intl.formatMessage({
                        id: 'pages.dao.config.tab.token.mint.records.table.column.operation.delete',
                      })}
                    </Button>
                  </Popconfirm>
                </>
              )}
            </Space>
          );
        },
      },
    ];
  }, [
    daoTokenMintRunningResult,
    dropMintRecordResult.loading,
    findLostTxForInitTokenMintRecordResult.data,
    findLostTxForInitTokenMintRecordResult.loading,
    handlerRefreshInitMintRecord,
    intl,
    linkTxHashResult.loading,
    manuallyBind,
    mutationDropMintRecord,
  ]);

  if (
    cyclesByTokenUnreleasedListResult.loading ||
    cyclesByTokenUnreleasedListResult.error ||
    cyclesByTokenUnreleasedListResult.data?.cyclesByTokenUnreleased === undefined ||
    daoTokenMintRunningResult.loading ||
    daoTokenMintRunningResult.error
  ) {
    return <PageLoading />;
  }

  return (
    <>
      {lpPoolAddress === ZeroAddress && (
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
          style={{ marginBottom: 30 }}
        />
      )}
      <div style={{ marginBottom: 30 }}>
        <Button type={'primary'} onClick={handlerOpenMintRecordView}>
          {intl.formatMessage({ id: 'pages.dao.config.tab.token.mint.record.button' })}
        </Button>
      </div>
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
              {selectCycles.map((c) => {
                return (
                  <Select.Option value={c.datum?.id || ''} key={c.datum?.id || ''}>
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
            {metamaskIsConnected && (
              <Button type="primary" disabled={!currentSelectCycle} onClick={handlerPreviewMint}>
                {/* <Button type="primary" onClick={handlerTestMint}> */}
                {intl.formatMessage({ id: 'pages.dao.config.tab.token.mint.form.button.submit' })}
              </Button>
            )}
            {!metamaskIsConnected && (
              <Button type="primary" onClick={() => handlerMetamaskConnect()}>
                {intl.formatMessage({
                  id: 'pages.common.connect',
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
          size={'middle'}
          dataSource={
            daoTokenMintSplitInfoResult.data?.dao?.tokenMintSplitInfo?.splitInfos as [SplitInfo]
          }
          rowKey={'userId'}
          pagination={false}
          scroll={{ x: 500, y: 300 }}
          loading={daoTokenMintSplitInfoResult.loading || false}
          bordered
          summary={(pageData) => {
            let totalSize = 0;
            pageData.forEach(({ ratio }) => {
              totalSize += ratio || 0;
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
                      id: 'pages.dao.config.tab.token.mint.preview.table.time_range',
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
      <GlobalModal
        key={'mintRecord'}
        visible={mintRecordModal}
        width={800}
        onCancel={() => setMintRecordModal(false)}
      >
        <Table<TokenMintRecordQuery>
          columns={mintRecordColumns}
          size={'middle'}
          dataSource={
            daoTokenMintRecordsResult.data?.dao?.tokenMintRecords?.nodes as [TokenMintRecordQuery]
          }
          rowKey={(r) => r?.datum?.id || ''}
          pagination={false}
          scroll={{ x: 500, y: 300 }}
          loading={daoTokenMintRecordsResult.loading || false}
          bordered
        />
      </GlobalModal>
    </>
  );
};

export default TokenMint;
