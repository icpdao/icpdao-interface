import type { ReactNode } from 'react';
import { PageContainer, PageLoading } from '@ant-design/pro-layout';
import { useAccess, FormattedMessage } from 'umi';
import GlobalBreadcrumb from '@/components/Breadcrumb';
import { CheckCircleFilled, FrownOutlined, HomeOutlined, SmileOutlined } from '@ant-design/icons';
import { useModel } from '@@/plugin-model/useModel';

import styles from './index.less';
import type { JobItemQuery, DaoCycleVoteListQueryVariables } from '@/services/dao/generated';
import {
  CycleVoteFilterEnum,
  CycleVoteResultTypeAllResultTypeEnum,
  useDaoCycleVoteListQuery,
  useUpdateAllVoteMutation,
  useUpdatePairVoteMutation,
  useUpdateVoteConfirmMutation,
} from '@/services/dao/generated';
import { useCallback, useEffect, useMemo, useState } from 'react';
import StatCard from '@/components/StatCard';
import { useIntl } from '@@/plugin-locale/localeExports';
import { Button, Card, Empty, message, Pagination, Row, Select, Skeleton, Tooltip } from 'antd';
import { getCurrentPage, getTimeDistanceHumanize } from '@/utils/utils';
import { getMetamaskProvider } from '@/services/ethereum-connect';
import moment from 'moment';
import { updateUserProfile } from '@/services/icpdao-interface/user';
import MentorWarningModal from '@/components/AccessButton/MentorWarningModal';

const breadcrumb = (daoId: string, cycleId: string) => [
  { icon: <HomeOutlined />, path: '', breadcrumbName: 'HOME', menuId: 'home' },
  { path: '/dao/explore', breadcrumbName: 'EXPLORE DAO', menuId: 'dao.explore' },
  { path: `/dao/${daoId}`, breadcrumbName: 'HOMEPAGE', menuId: 'dao.home' },
  { path: `/dao/${daoId}/${cycleId}/vote`, breadcrumbName: 'VOTE', menuId: 'dao.vote' },
];

const typeDesc = (t: number) => {
  return (
    <div key={`${t}_vote_desc`} className={styles.voteDesc}>
      <FormattedMessage id={`pages.dao.vote.${t === 0 ? 'pair' : 'all'}.desc`} />
    </div>
  );
};

const allTypeVote = (
  voteId: string,
  pair: JobItemQuery,
  voted: CycleVoteResultTypeAllResultTypeEnum,
  updateVote: (voteId: string, voted: boolean) => void,
  voteLoading: boolean | undefined,
) => {
  let leftButtonColor: string = '';
  let rightButtonColor: string = '';
  if (voted === CycleVoteResultTypeAllResultTypeEnum.Yes) {
    leftButtonColor = '#2F80ED';
    rightButtonColor = '#000000';
  }
  if (voted === CycleVoteResultTypeAllResultTypeEnum.No) {
    leftButtonColor = '#000000';
    rightButtonColor = '#EC6262';
  }
  if (voted === null) {
    leftButtonColor = '#000000';
    rightButtonColor = '#000000';
  }

  return (
    <div key={voteId}>
      <Skeleton active loading={voteLoading || false} />
      {!voteLoading && (
        <Card className={`${styles.allTypeVoteCard} ${!!voted && styles.VotedPairBG}`} key={voteId}>
          <div className={styles.allTypeVoteContent}>
            <Row>{pair?.user?.nickname}</Row>
            <Row>
              <a
                href={`https://github.com/${pair?.datum?.githubRepoOwner}/${pair?.datum?.githubRepoName}/issues/${pair?.datum?.githubIssueNumber}`}
                target="_blank"
              >
                {pair?.datum?.title}
              </a>
            </Row>
            <Row>Size: {parseFloat(pair?.datum?.size.toString() || '').toFixed(1)}</Row>
          </div>
          <div className={styles.allTypeVoteButtons}>
            <div className={styles.allTypeVoteButton} onClick={() => updateVote(voteId, true)}>
              <div>
                <SmileOutlined style={{ fontSize: 21, color: leftButtonColor }} />
              </div>
              <div style={{ color: leftButtonColor }}>YES</div>
            </div>
            <div className={styles.allTypeVoteButton} onClick={() => updateVote(voteId, false)}>
              <div>
                <FrownOutlined style={{ fontSize: 21, color: rightButtonColor }} />
              </div>
              <div style={{ color: rightButtonColor }}>NO</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

const pairTypeVote = (
  voteId: string,
  leftPair: JobItemQuery,
  rightPair: JobItemQuery,
  voted: string,
  updateVote: (voteId: string, voteJobId: string) => void,
  voteLoading: boolean | undefined,
) => {
  return (
    <div key={voteId} className={styles.pairTypeVoteCards}>
      <Skeleton active loading={voteLoading || false} />
      {!voteLoading && (
        <>
          <Card
            className={`${styles.pairTypeVoteCard} ${!!voted && styles.VotedPairBG}`}
            hoverable={voted !== leftPair.datum?.id}
            onClick={() => updateVote(voteId, leftPair.datum?.id || '')}
          >
            <div className={styles.pairTypeVoteContent}>
              <Row>{leftPair?.user?.nickname}</Row>
              <Row>
                <a
                  href={`https://github.com/${leftPair?.datum?.githubRepoOwner}/${leftPair?.datum?.githubRepoName}/issues/${leftPair?.datum?.githubIssueNumber}`}
                  target="_blank"
                >
                  {leftPair?.datum?.title}
                </a>
              </Row>
              <Row>Size: {parseFloat(leftPair?.datum?.size.toString() || '').toFixed(1)}</Row>
              {voted === leftPair.datum?.id && (
                <div className={styles.pairTypeVoteCheck}>
                  <CheckCircleFilled style={{ fontSize: 21, color: '#2F80ED' }} />
                </div>
              )}
            </div>
          </Card>
          <Card
            className={`${styles.pairTypeVoteCard} ${!!voted && styles.VotedPairBG}`}
            hoverable={voted !== rightPair.datum?.id}
            onClick={() => updateVote(voteId, rightPair.datum?.id || '')}
          >
            <div className={styles.pairTypeVoteContent}>
              <Row>{rightPair?.user?.nickname}</Row>
              <Row>
                <a
                  href={`https://github.com/${rightPair?.datum?.githubRepoOwner}/${rightPair?.datum?.githubRepoName}/issues/${rightPair?.datum?.githubIssueNumber}`}
                  target="_blank"
                >
                  {rightPair?.datum?.title}
                </a>
              </Row>
              <Row>Size: {parseFloat(rightPair?.datum?.size.toString() || '').toFixed(1)}</Row>
              {voted === rightPair.datum?.id && (
                <div className={styles.pairTypeVoteCheck}>
                  <CheckCircleFilled style={{ fontSize: 21, color: '#2F80ED' }} />
                </div>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

const pageSize = 20;

export default (props: { match: { params: { cycleId: string; daoId: string } } }): ReactNode => {
  const { cycleId, daoId } = props.match.params;
  const intl = useIntl();
  const [confirmButtonLoading, setConfirmButtonLoading] = useState<boolean>(false);
  const [voteLoading, setVoteLoading] = useState<Record<string, boolean>>({});
  const { initialState } = useModel('@@initialState');
  const { isConnected, metamaskProvider, event$ } = useModel('useWalletModel');
  const [queryVariables, setQueryVariables] = useState<DaoCycleVoteListQueryVariables>({
    cycleId,
    first: pageSize,
    offset: 0,
  });
  const { data, loading, refetch } = useDaoCycleVoteListQuery({
    variables: queryVariables,
    fetchPolicy: 'no-cache',
  });
  const [updateAllVoteMutation, updateAllVoteResult] = useUpdateAllVoteMutation();
  const [updatePairVoteMutation, updatePairVoteResult] = useUpdatePairVoteMutation();
  const [updateVoteConfirm] = useUpdateVoteConfirmMutation();

  const access = useAccess();

  const [warningModalVisible, setWarningModalVisible] = useState(false);

  const warningModal = useMemo(() => {
    return (
      <MentorWarningModal
        key={'warningModal'}
        visible={warningModalVisible}
        setVisible={setWarningModalVisible}
      />
    );
  }, [warningModalVisible]);

  const updateAllVote = useCallback(
    async (voteId: string, voted: boolean) => {
      if (access.isNormal()) {
        setWarningModalVisible(true);
        return;
      }
      if (data?.cycle?.votes?.confirm === true) {
        message.warn(intl.formatMessage({ id: 'pages.dao.vote.already_confirm' }));
        return;
      }
      try {
        setVoteLoading({ [voteId]: true });
        await updateAllVoteMutation({ variables: { voteId, vote: voted } });
      } catch (e) {
        console.log('Vote Failed');
      }
    },
    [data?.cycle?.votes?.confirm, intl, updateAllVoteMutation],
  );
  const updatePairVote = useCallback(
    async (voteId: string, voteJobId: string) => {
      if (access.isNormal()) {
        setWarningModalVisible(true);
        return;
      }
      if (data?.cycle?.votes?.confirm === true) {
        message.warn(intl.formatMessage({ id: 'pages.dao.vote.already_confirm' }));
        return;
      }
      try {
        setVoteLoading({ [voteId]: true });
        await updatePairVoteMutation({ variables: { voteId, voteJobId } });
      } catch (e) {
        console.log('Vote Failed');
      }
    },
    [data?.cycle?.votes?.confirm, intl, updatePairVoteMutation],
  );

  useEffect(() => {
    if (
      updatePairVoteResult.data?.updatePairVote?.ok === false ||
      updateAllVoteResult.data?.updateAllVote?.ok === false
    )
      message.success(intl.formatMessage({ id: 'pages.dao.vote.failed' }));
  }, [
    intl,
    updateAllVoteResult.data?.updateAllVote?.ok,
    updatePairVoteResult.data?.updatePairVote?.ok,
  ]);

  useEffect(() => {
    if (!updatePairVoteResult.loading || !updateAllVoteResult.loading)
      refetch().then(() => {
        setVoteLoading({});
      });
  }, [refetch, updateAllVoteResult.loading, updatePairVoteResult.loading]);

  const changePage = useCallback((page: number) => {
    setQueryVariables((old) => ({
      ...old,
      offset: (page - 1) * pageSize,
    }));
  }, []);

  const voteList = useCallback(() => {
    const listDom: any[] = [];
    let lastV: number | undefined;
    data?.cycle?.votes?.nodes?.forEach((v) => {
      if (v?.datum?.voteType === 0) {
        if (lastV === 1 || lastV === undefined) {
          listDom.push(typeDesc(0));
        }
        listDom.push(
          pairTypeVote(
            v.datum.id || '',
            v.leftJob as JobItemQuery,
            v.rightJob as JobItemQuery,
            v.voteJob?.datum?.id || '',
            updatePairVote,
            voteLoading[v.datum.id || ''],
          ),
        );
      }
      if (v?.datum?.voteType === 1) {
        if (lastV === undefined) {
          listDom.push(typeDesc(1));
        }
        listDom.push(
          allTypeVote(
            v.datum.id || '',
            v.leftJob as JobItemQuery,
            v.selfVoteResultTypeAll as CycleVoteResultTypeAllResultTypeEnum,
            updateAllVote,
            voteLoading[v.datum.id || ''],
          ),
        );
      }
      lastV = v?.datum?.voteType;
    });
    if (listDom.length > 0) return listDom;
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }, [data?.cycle?.votes?.nodes, updateAllVote, updatePairVote, voteLoading]);

  const handleSubmit = useCallback(async () => {
    if (!initialState) return;
    const provider = getMetamaskProvider(metamaskProvider);
    if (!provider) return;
    try {
      const signer = provider.getSigner();
      const signatureAddress = await signer.getAddress();

      const walletAddress = initialState.currentUser().profile.erc20_address;
      if (walletAddress && walletAddress !== signatureAddress) {
        message.error(intl.formatMessage({ id: 'pages.dao.vote.sign.disagree_wallet' }));
        return;
      }
      setConfirmButtonLoading(true);
      if (!walletAddress) {
        await updateUserProfile({ erc20_address: signatureAddress });
      }
      const signatureMsg = `I confirm the voting results of ${daoId} DAO's ${cycleId} cycle and will not modify the vote any more. ${moment().unix()}`;
      const signature = await signer.signMessage(signatureMsg);
      await updateVoteConfirm({
        variables: { cycleId, signatureAddress, signatureMsg, signature },
      });
      await refetch();
      setConfirmButtonLoading(false);
    } catch (e) {
      setConfirmButtonLoading(false);
    }
  }, [cycleId, daoId, initialState, intl, metamaskProvider, refetch, updateVoteConfirm]);

  const handlerMetamaskConnect = useCallback(() => {
    event$?.emit();
  }, [event$]);

  const canSubmitConfirm = useMemo(() => {
    if (data?.cycle?.votes?.confirm === false) {
      const unVoteData = data?.cycle.votes.nodes?.filter((node) => {
        if (node?.datum?.voteType === 1 && !!node.datum.voteResultStatTypeAll) return false;
        return !(node?.datum?.voteType === 0 && !!node.datum.voteJobId);
      });
      if (!unVoteData) return false;
      return unVoteData.length === 0;
    }
    return false;
  }, [data?.cycle?.votes?.confirm, data?.cycle?.votes?.nodes]);

  const statCardData = useMemo(() => {
    return [
      {
        title: intl.formatMessage({ id: 'pages.dao.vote.card.ticket' }),
        number: data?.cycle?.votes?.total || 0,
      },
      {
        title: intl.formatMessage({ id: 'pages.dao.vote.card.un_vote' }),
        number: (
          <span className={styles.UnVoteCardColor}>{data?.cycle?.votes?.userUnVoteTotal || 0}</span>
        ),
      },
      {
        title: intl.formatMessage({ id: 'pages.dao.vote.card.voted' }),
        number: (
          <span className={styles.VotedCardColor}>{data?.cycle?.votes?.userVotedTotal || 0}</span>
        ),
      },
    ];
  }, [
    data?.cycle?.votes?.total,
    data?.cycle?.votes?.userUnVoteTotal,
    data?.cycle?.votes?.userVotedTotal,
    intl,
  ]);

  const handlerFilterVote = useCallback((filter) => {
    setQueryVariables((old) => ({
      ...old,
      voteFilter: filter,
    }));
  }, []);

  if (!initialState) {
    return <PageLoading />;
  }

  const endLeftTimes = getTimeDistanceHumanize(data?.cycle?.datum?.voteEndAt || 0);

  return (
    <>
      <PageContainer
        ghost
        header={{
          breadcrumbRender: () => <GlobalBreadcrumb routes={breadcrumb(daoId, cycleId)} />,
        }}
      >
        <div className={styles.first}>
          <Tooltip
            placement="right"
            title={intl.formatMessage(
              { id: 'pages.dao.vote.submit.tips' },
              { end_left_times: endLeftTimes },
            )}
          >
            {isConnected ? (
              <Button
                type="primary"
                loading={confirmButtonLoading}
                className={styles.submitButton}
                onClick={handleSubmit}
                disabled={!canSubmitConfirm}
              >
                {intl.formatMessage({ id: 'pages.dao.vote.submit' })}
              </Button>
            ) : (
              <Button
                type="primary"
                onClick={() => handlerMetamaskConnect()}
                className={styles.submitButton}
              >
                {intl.formatMessage({
                  id: 'pages.common.connect',
                })}
              </Button>
            )}
          </Tooltip>
          <StatCard data={statCardData} />
          <div className={styles.VoteFilterSelect}>
            <Select
              defaultValue={CycleVoteFilterEnum.All}
              onChange={handlerFilterVote}
              style={{ width: 200 }}
            >
              <Select.Option value={CycleVoteFilterEnum.All}>ALL</Select.Option>
              <Select.Option value={CycleVoteFilterEnum.UnVote}>TO VOTE</Select.Option>
              <Select.Option value={CycleVoteFilterEnum.Voted}>VOTED</Select.Option>
            </Select>
          </div>
          <Skeleton active loading={loading} />
          {!loading && voteList()}
          <div className={styles.pagination}>
            <Pagination
              pageSize={pageSize}
              current={getCurrentPage(queryVariables.offset || 0, pageSize)}
              total={data?.cycle?.votes?.total || 0}
              onChange={(page) => changePage(page)}
            />
          </div>
        </div>
        {warningModal}
      </PageContainer>
    </>
  );
};
