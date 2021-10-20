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
import { useModel } from '@@/plugin-model/useModel';
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
  Radio,
  Select,
  Skeleton,
  Space,
  Spin,
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
import type { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core';
import type { FeeAmount, Pool } from '@uniswap/v3-sdk';
import { Bound, Field, PoolState, useUniswap } from '@/pages/Dao/hooks/useUniswap';
import IconFont from '@/components/IconFont';

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
  lpPoolAddress,
  tokenContract,
  tokenSymbol,
}) => {
  const intl = useIntl();
  const { network, contract, account, chainId } = useModel('useWalletModel');
  const [cycles, setCycles] = useState<Record<string, CycleQuery>>({});
  const [selectCycles, setSelectCycles] = useState<CycleQuery[]>([]);
  const [currentSelectCycle, setCurrentSelectCycle] = useState<string>('');
  const [previewMintBeginTime, setPreviewMintBeginTime] = useState<number[]>([0, 0]);
  const [previewMintEndTime, setPreviewMintEndTime] = useState<number[]>([0, 0]);
  const [advancedOP, setAdvancedOP] = useState<boolean>(false);
  const [previewMint, setPreviewMint] = useState<boolean>(false);
  const [mintRecordModal, setMintRecordModal] = useState<boolean>(false);
  const [mintButtonLoading, setMintButtonLoading] = useState<boolean>(false);

  const [showCompleteAlert, setShowCompleteAlert] = useState<boolean>(false);

  const [currentMintBody, setCurrentMintBody] = useState<ETH_CONNECT.Mint>();

  const [loadingTransferComplete, setLoadingTransferComplete] = useState<boolean>(false);

  // -----
  const [baseCurrency, setBaseCurrency] = useState<Currency>();
  const [quoteCurrency, setQuoteCurrency] = useState<Currency>();
  const [maxBaseTokenAmount] = useState<CurrencyAmount<Currency>>();
  const [maxQuoteTokenAmount] = useState<CurrencyAmount<Currency>>();
  const [feeAmount, setFeeAmount] = useState<FeeAmount>();
  useEffect(() => {
    if (!lpPoolAddress || lpPoolAddress === ZeroAddress || !tokenAddress) return;
    contract.uniswapPool.getPoolByAddress(lpPoolAddress, tokenAddress).then((pl) => {
      setBaseCurrency(pl.tokenA?.address === tokenAddress ? pl.tokenA : pl.tokenB);
      setQuoteCurrency(pl.tokenA?.address === tokenAddress ? pl.tokenB : pl.tokenA);
      setFeeAmount(pl.pool.fee);
    });
  }, [contract.uniswapPool, lpPoolAddress, tokenAddress]);

  const transformed: [Token, Token, FeeAmount] | null = useMemo(() => {
    if (!chainId || !baseCurrency || !quoteCurrency || !feeAmount) return null;
    const ta = baseCurrency?.wrapped;
    const tb = quoteCurrency?.wrapped;
    if (!ta || !tb || ta.equals(tb)) return null;
    const [token0, token1] = ta.sortsBefore(tb) ? [ta, tb] : [tb, ta];
    return [token0, token1, feeAmount];
  }, [chainId, feeAmount, baseCurrency, quoteCurrency]);

  const [poolInfo, setPoolInfo] = useState<[PoolState, Pool | null]>();

  useEffect(() => {
    if (!transformed || !transformed[0] || !transformed[1] || !transformed[2]) {
      setPoolInfo([PoolState.INVALID, null]);
      return;
    }
    contract.uniswapPool
      .getPool(transformed[0], transformed[1], transformed[2])
      .then(({ pool: pl, sqrtPriceX96 }) => {
        if (!pl || !sqrtPriceX96 || sqrtPriceX96.eq(0)) {
          setPoolInfo([PoolState.NOT_EXISTS, null]);
          return;
        }
        setPoolInfo([PoolState.EXISTS, pl]);
      });
  }, [contract.uniswapPool, transformed]);

  const [inputState, setInputState] =
    useState<{ field: Field; typedValue: string; noLiquidity: boolean }>();
  const [leftRangeState, setLeftRangeState] = useState<string | true>(true);
  const [rightRangeState, setRightRangeState] = useState<string | true>(true);
  const [startPriceState, setStartPriceState] = useState<string>();

  const balances: (CurrencyAmount<Currency> | undefined)[] = useMemo(() => {
    return [maxBaseTokenAmount, maxQuoteTokenAmount];
  }, [maxBaseTokenAmount, maxQuoteTokenAmount]);

  const {
    noLiquidity,
    invalidPool,
    ticksAtLimit,
    onLeftRangeInput,
    onRightRangeInput,
    leftPrice,
    rightPrice,
    getDecrementLower,
    getIncrementLower,
    getDecrementUpper,
    getIncrementUpper,
    isSorted,
    getNoQuoteTokenPrice,
    pool,
    tickLower,
    tickUpper,
    getNoQuoteTokenTick,
    invertPrice,
  } = useUniswap(
    { inputState, leftRangeState, rightRangeState, startPriceState },
    { setInputState, setLeftRangeState, setRightRangeState, setStartPriceState },
    balances,
    poolInfo,
    baseCurrency ?? undefined,
    quoteCurrency ?? undefined,
    feeAmount,
    baseCurrency ?? undefined,
    undefined,
  );

  const noQuoteTokenPrice = useMemo(() => {
    const currentTick = pool?.tickCurrent;
    console.log({ currentTick });
    if (!currentTick) return undefined;
    return getNoQuoteTokenPrice(currentTick);
  }, [getNoQuoteTokenPrice, pool?.tickCurrent]);

  const noQuoteTokenTick = useMemo(() => {
    const currentTick = pool?.tickCurrent;
    if (!currentTick) return undefined;
    return getNoQuoteTokenTick(currentTick);
  }, [getNoQuoteTokenTick, pool?.tickCurrent]);

  console.log({ noQuoteTokenTick });

  const setNoQuoteTokenPriceRange = useCallback(() => {
    if (!noQuoteTokenPrice) return;
    console.log('no quote price lower', noQuoteTokenPrice[Bound.LOWER]?.toSignificant(10));
    console.log('no quote price upper', noQuoteTokenPrice[Bound.UPPER]?.toSignificant(10));
    onLeftRangeInput(
      noQuoteTokenPrice[!invertPrice ? Bound.LOWER : Bound.UPPER]?.toSignificant(10) || '',
    );
    onRightRangeInput(
      noQuoteTokenPrice[!invertPrice ? Bound.UPPER : Bound.LOWER]?.toSignificant(10) || '',
    );
  }, [invertPrice, noQuoteTokenPrice, onLeftRangeInput, onRightRangeInput]);

  useEffect(() => {
    setNoQuoteTokenPriceRange();
  }, [setNoQuoteTokenPriceRange]);

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
    if (!tokenContract || !daoId || !tokenAddress) return;
    tokenContract.getMintAnchor().then((anc) => {
      console.log(anc);
      setAnchor(anc);
      queryCyclesByTokenUnreleasedList({
        variables: {
          daoId,
          lastTimestamp: anc.lastTimestamp.toString(),
          tokenChainId: chainId?.toString() || '1',
          tokenAddress,
        },
      });
    });
  }, [chainId, daoId, queryCyclesByTokenUnreleasedList, tokenAddress, tokenContract]);

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
      !daoTokenMintSplitInfoResult.data?.dao?.tokenMintSplitInfo?.splitInfos ||
      !noQuoteTokenTick
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
        tickLower: (advancedOP ? tickLower : noQuoteTokenTick[Bound.LOWER]) || 0,
        tickUpper: (advancedOP ? tickUpper : noQuoteTokenTick[Bound.UPPER]) || 0,
        // tickLower: tickLower || 0,
        // tickUpper: tickUpper || 0,
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
          chainId: EthereumChainId[network]?.toString() || '1',
          tokenSymbol: tokenSymbol || '',
        },
      });
      console.log({ createTokenMintMutationResult });
    } catch (e) {
      setMintButtonLoading(false);
      setLoadingTransferComplete(false);
    }
  }, [
    tokenSymbol,
    advancedOP,
    anchor,
    createTokenMintMutationResult,
    currentSelectCycle,
    daoId,
    daoTokenMintSplitInfoResult.data?.dao?.tokenMintSplitInfo?.splitInfos,
    mutationCreateTokenMintMutation,
    network,
    noQuoteTokenTick,
    previewMintEndTime,
    selectCycles,
    tickLower,
    tickUpper,
    tokenAddress,
    tokenContract,
  ]);

  useEffect(() => {
    if (!tokenContract || !currentMintBody || createTokenMintMutationResult.loading) return;
    const mintRecordId =
      createTokenMintMutationResult.data?.createTokenMintRecord?.tokenMintRecord?.id;
    if (mintRecordId && account) {
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
                setShowCompleteAlert(true);
                // setLoadingTransferComplete(false);
              });
            },
          );
        })
        .catch(() => {
          mutationDropMintRecord({ variables: { recordId: mintRecordId } });
          setMintButtonLoading(false);
          // setLoadingTransferComplete(false);
        });
    } else {
      message.warn(
        intl.formatMessage({ id: 'pages.dao.config.tab.token.mint.create_record.failed' }),
      );
    }
  }, [
    account,
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

  useEffect(() => {
    const successRecord = daoTokenMintRecordsResult.data?.dao?.tokenMintRecords?.nodes?.filter(
      (tmr) => tmr?.datum?.status === 2,
    );
    if (
      successRecord &&
      successRecord.length === daoTokenMintRecordsResult.data?.dao?.tokenMintRecords?.nodes?.length
    )
      setLoadingTransferComplete(false);
  }, [daoTokenMintRecordsResult.data?.dao?.tokenMintRecords?.nodes]);

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

  const previewModalDisabledOk = useMemo(() => {
    return (
      daoTokenMintSplitInfoResult.data?.dao?.tokenMintSplitInfo?.splitInfos?.filter((d) => {
        return !d?.userErc20Address;
      }).length !== 0 || false
    );
  }, [daoTokenMintSplitInfoResult.data?.dao?.tokenMintSplitInfo?.splitInfos]);

  if (
    cyclesByTokenUnreleasedListResult.loading ||
    cyclesByTokenUnreleasedListResult.error ||
    cyclesByTokenUnreleasedListResult.data?.cyclesByTokenUnreleased === undefined ||
    daoTokenMintRunningResult.loading ||
    daoTokenMintRunningResult.error
  ) {
    return <Skeleton active />;
  }

  return (
    <>
      {showCompleteAlert && (
        <Alert
          message="Warning"
          description={<>{intl.formatMessage({ id: 'pages.token.mint.complete' })}</>}
          type="warning"
          showIcon
          style={{ marginBottom: 30 }}
        />
      )}
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
      <Form name={'tokenMintRecord'}>
        <Form.Item wrapperCol={{ offset: 3, span: 4 }}>
          <Button type={'primary'} onClick={handlerOpenMintRecordView} block>
            {intl.formatMessage({ id: 'pages.dao.config.tab.token.mint.record.button' })}
          </Button>
        </Form.Item>
      </Form>
      <Spin
        tip={intl.formatMessage({ id: 'pages.token.mint.pending' })}
        spinning={loadingTransferComplete}
      >
        <Form name={'tokenMintForm'} labelCol={{ span: 3 }} wrapperCol={{ span: 8 }}>
          <Form.Item
            label={intl.formatMessage({ id: 'pages.dao.config.tab.token.mint.form.end_cycle' })}
            tooltip={{
              title: intl.formatMessage({
                id: 'pages.dao.config.tab.token.mint.form.end_cycle.desc',
              }),
              icon: <IconFont type={'icon-question'} />,
            }}
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
          {!!lpPoolAddress && lpPoolAddress !== ZeroAddress && (
            <Form.Item wrapperCol={{ offset: 3, span: 8 }}>
              <Radio.Group
                value={advancedOP ? 'advanced' : 'normal'}
                buttonStyle="solid"
                disabled={!feeAmount || invalidPool || (noLiquidity && !startPriceState)}
                onChange={(v) => {
                  setAdvancedOP(v.target.value === 'advanced');
                  setNoQuoteTokenPriceRange();
                  setRightRangeState(true);
                }}
              >
                <Radio.Button value="normal">
                  <FormattedMessage id={`pages.dao.config.tab.token.create.form.normal`} />
                </Radio.Button>
                <Radio.Button value="advanced">
                  <FormattedMessage id={`pages.dao.config.tab.token.create_pool.form.advanced`} />
                </Radio.Button>
              </Radio.Group>
            </Form.Item>
          )}
          {advancedOP && (
            <>
              <Form.Item
                label={intl.formatMessage({
                  id: 'pages.dao.config.tab.token.mint.form.min_price',
                })}
                tooltip={{
                  title: intl.formatMessage({
                    id: 'pages.dao.config.tab.token.mint.form.min_price.desc',
                  }),
                  icon: <IconFont type={'icon-question'} />,
                }}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  disabled={!feeAmount || invalidPool || (noLiquidity && !startPriceState)}
                  value={
                    ticksAtLimit[isSorted ? Bound.LOWER : Bound.UPPER]
                      ? '0'
                      : leftPrice?.toSignificant(10) ?? ''
                  }
                  onChange={(value) => {
                    onLeftRangeInput(value);
                  }}
                  onStep={(_, info) => {
                    if (info.type === 'up') getIncrementLower();
                    if (info.type === 'down') getDecrementLower();
                  }}
                />
              </Form.Item>
              <Form.Item
                label={intl.formatMessage({
                  id: 'pages.dao.config.tab.token.mint.form.max_price',
                })}
                tooltip={{
                  title: intl.formatMessage({
                    id: 'pages.dao.config.tab.token.mint.form.max_price.desc',
                  }),
                  icon: <IconFont type={'icon-question'} />,
                }}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  disabled={!feeAmount || invalidPool || (noLiquidity && !startPriceState)}
                  value={
                    ticksAtLimit[isSorted ? Bound.UPPER : Bound.LOWER]
                      ? '∞'
                      : rightPrice?.toSignificant(10) ?? ''
                  }
                  onChange={(value) => {
                    onRightRangeInput(value);
                  }}
                  onStep={(_, info) => {
                    if (info.type === 'up') getIncrementUpper();
                    if (info.type === 'down') getDecrementUpper();
                  }}
                />
              </Form.Item>
            </>
          )}
          <Form.Item wrapperCol={{ offset: 3, span: 8 }}>
            <Button
              type="primary"
              disabled={
                !currentSelectCycle ||
                (!!lpPoolAddress &&
                  lpPoolAddress !== ZeroAddress &&
                  (!feeAmount || invalidPool || (noLiquidity && !startPriceState)))
              }
              onClick={handlerPreviewMint}
            >
              {/* <Button type="primary" onClick={handlerTestMint}> */}
              {intl.formatMessage({ id: 'pages.dao.config.tab.token.mint.form.button.submit' })}
            </Button>
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
        disabledOk={previewModalDisabledOk}
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
