import type { ReactNode } from 'react';
import { PageContainer, PageLoading } from '@ant-design/pro-layout';
import { useAccess, FormattedMessage } from 'umi';
import GlobalBreadcrumb from '@/components/Breadcrumb';
import { CheckCircleFilled, FrownOutlined, HomeOutlined, SmileOutlined } from '@ant-design/icons';
import { useModel } from '@@/plugin-model/useModel';

import PermissionErrorPage from '@/pages/403';
import styles from './index.less';
import type { JobItemQuery, DaoCycleVoteListQueryVariables } from '@/services/dao/generated';
import {
  CycleVoteResultTypeAllResultTypeEnum,
  useDaoCycleVoteListQuery,
  useUpdateAllVoteMutation,
  useUpdatePairVoteMutation,
} from '@/services/dao/generated';
import { useCallback, useState } from 'react';
import StatCard from '@/components/StatCard';
import { useIntl } from '@@/plugin-locale/localeExports';
import { Button, Card, message, Pagination, Row, Tooltip } from 'antd';
import { getCurrentPage, getTimeDistanceHumanize } from '@/utils/utils';

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
    <Card className={styles.allTypeVoteCard} key={voteId}>
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
        <Row>Size: {pair?.datum?.size}</Row>
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
  );
};

const pairTypeVote = (
  voteId: string,
  leftPair: JobItemQuery,
  rightPair: JobItemQuery,
  voted: string,
  updateVote: (voteId: string, voteJobId: string) => void,
) => {
  return (
    <div key={voteId} className={styles.pairTypeVoteCards}>
      <Card
        className={styles.pairTypeVoteCard}
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
          <Row>Size: {leftPair?.datum?.size}</Row>
          {voted === leftPair.datum?.id && (
            <div className={styles.pairTypeVoteCheck}>
              <CheckCircleFilled style={{ fontSize: 21, color: '#2F80ED' }} />
            </div>
          )}
        </div>
      </Card>
      <Card
        className={styles.pairTypeVoteCard}
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
          <Row>Size: {rightPair?.datum?.size}</Row>
          {voted === rightPair.datum?.id && (
            <div className={styles.pairTypeVoteCheck}>
              <CheckCircleFilled style={{ fontSize: 21, color: '#2F80ED' }} />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

const pageSize = 20;

export default (props: { match: { params: { cycleId: string; daoId: string } } }): ReactNode => {
  const { cycleId, daoId } = props.match.params;
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');
  const [queryVariables, setQueryVariables] = useState<DaoCycleVoteListQueryVariables>({
    cycleId,
    first: pageSize,
    offset: 0,
  });
  const { data, loading, error, refetch } = useDaoCycleVoteListQuery({
    variables: queryVariables,
    fetchPolicy: 'no-cache',
  });
  const [updateAllVoteMutation] = useUpdateAllVoteMutation();
  const [updatePairVoteMutation] = useUpdatePairVoteMutation();
  const updateAllVote = useCallback(
    async (voteId: string, voted: boolean) => {
      try {
        const uam = await updateAllVoteMutation({ variables: { voteId, vote: voted } });
        await refetch();
        if (uam.data?.updateAllVote?.ok) message.success('Voted');
        else message.error('Vote Failed');
      } catch (e) {
        message.error('Vote Failed');
      }
    },
    [refetch, updateAllVoteMutation],
  );
  const updatePairVote = useCallback(
    async (voteId: string, voteJobId: string) => {
      try {
        const uam = await updatePairVoteMutation({ variables: { voteId, voteJobId } });
        await refetch();
        if (uam.data?.updatePairVote?.ok) message.success('Voted');
        else message.error('Vote Failed');
      } catch (e) {
        message.error('Vote Failed');
      }
    },
    [refetch, updatePairVoteMutation],
  );
  const access = useAccess();
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
        if (lastV === 1) {
          listDom.push(typeDesc(0));
        }
        listDom.push(
          pairTypeVote(
            v.datum.id || '',
            v.leftJob as JobItemQuery,
            v.rightJob as JobItemQuery,
            v.voteJob?.datum?.id || '',
            updatePairVote,
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
          ),
        );
      }
      lastV = v?.datum?.voteType;
    });
    return listDom;
  }, [data, updateAllVote, updatePairVote]);

  const handleSubmit = useCallback(() => {
    message.info('还没有集成 token，不用点击这个提交按钮');
  }, []);

  if (!initialState || loading || error) {
    return <PageLoading />;
  }

  if (!access.isIcpper()) {
    return <PermissionErrorPage />;
  }

  const statCardData = [
    {
      title: intl.formatMessage({ id: 'pages.dao.vote.card.ticket' }),
      number: data?.cycle?.votes?.total || 0,
    },
  ];

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
            <Button type="primary" className={styles.submitButton} onClick={handleSubmit}>
              {intl.formatMessage({ id: 'pages.dao.vote.submit' })}
            </Button>
          </Tooltip>
          <StatCard data={statCardData} />
          {voteList()}
          <div className={styles.pagination}>
            <Pagination
              pageSize={pageSize}
              current={getCurrentPage(queryVariables.offset || 0, pageSize)}
              total={data?.cycle?.votes?.total || 0}
              onChange={(page) => changePage(page)}
            />
          </div>
        </div>
      </PageContainer>
    </>
  );
};
