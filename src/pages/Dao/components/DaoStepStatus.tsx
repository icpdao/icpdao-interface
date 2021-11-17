import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Col, Popconfirm, Row, Skeleton, Steps, Tooltip } from 'antd';
import type { CycleQuery } from '@/services/dao/generated';
import {
  CycleStepEnum,
  UpdateDaoLastCycleStepEnum,
  useDaoLastCycleStatusQuery,
  useUpdateDaoLastCycleStepMutation,
} from '@/services/dao/generated';
import AccessButton from '@/components/AccessButton';
import { AccessEnum } from '@/access';
import { FormattedMessage } from '@@/plugin-locale/localeExports';
import { getFormatTime, getTimeDistanceHumanize } from '@/utils/utils';
import { useIntl } from 'umi';
import { history } from '@@/core/history';
import StepPairing from '@/pages/Dao/components/step/pairing';
import { Loading3QuartersOutlined } from '@ant-design/icons';

const { Step } = Steps;

const currentIndex = {
  [CycleStepEnum.Job]: 0,
  [CycleStepEnum.Pair]: 1,
  [CycleStepEnum.Vote]: 2,
  [CycleStepEnum.VoteEnd]: 3,
};

const DaoStepStatus: React.FC<{ daoId: string; isOwner: boolean }> = ({ daoId, isOwner }) => {
  const intl = useIntl();
  const { data, loading, refetch } = useDaoLastCycleStatusQuery({ variables: { daoId } });
  const [currentCycle, setCurrentCycle] = useState<CycleQuery>();
  const [updateDaoLastCycleStepMutation, mutationUpdateDaoLastCycleStepResult] =
    useUpdateDaoLastCycleStepMutation();

  useEffect(() => {
    if (!data?.dao?.lastCycle) return;
    setCurrentCycle(data?.dao?.lastCycle as CycleQuery);
  }, [data?.dao?.lastCycle]);

  useEffect(() => {
    setCurrentCycle(
      mutationUpdateDaoLastCycleStepResult.data?.updateDaoLastCycleStep?.dao
        ?.lastCycle as CycleQuery,
    );
  }, [mutationUpdateDaoLastCycleStepResult?.data?.updateDaoLastCycleStep?.dao?.lastCycle]);

  const current = useMemo(() => {
    return currentCycle?.step?.status || CycleStepEnum.Job;
  }, [currentCycle?.step?.status]);

  const goVoteButtonTipTitle = useMemo(() => {
    if (current === CycleStepEnum.Vote && currentCycle?.datum?.voteEndAt) {
      return intl.formatMessage(
        { id: 'pages.dao.home.button.vote.tips.time_left' },
        { date_string: getTimeDistanceHumanize(currentCycle?.datum?.voteEndAt) },
      );
    }

    if (current === CycleStepEnum.Vote && currentCycle?.datum?.voteBeginAt) {
      return intl.formatMessage(
        { id: 'pages.dao.home.button.vote.tips.time_start' },
        { date_string: getTimeDistanceHumanize(currentCycle?.datum?.voteBeginAt) },
      );
    }
    return '';
  }, [current, currentCycle?.datum?.voteBeginAt, currentCycle?.datum?.voteEndAt, intl]);

  const handleGoVote = useCallback(() => {
    if (current === CycleStepEnum.Vote && currentCycle?.datum) {
      history.push(`/dao/${daoId}/${currentCycle?.datum?.id}/vote`);
    }
  }, [current, daoId, currentCycle?.datum]);

  const markJobButton = useMemo(() => {
    let markJobButtonTipTitle = '';
    if (current === CycleStepEnum.Job && currentCycle?.datum?.endAt) {
      markJobButtonTipTitle = intl.formatMessage(
        { id: 'pages.dao.home.button.mark.tips' },
        { date_string: getFormatTime(currentCycle?.datum?.endAt, 'LL') },
      );
    } else {
      markJobButtonTipTitle = intl.formatMessage({
        id: 'pages.dao.home.step.mark_job.tips.default',
      });
    }
    const handleMarkJob = () => {
      history.push(`/job?daoId=${daoId}`);
    };
    return (
      <Tooltip placement="right" title={markJobButtonTipTitle}>
        <AccessButton
          allow={AccessEnum.PREICPPER}
          size={'large'}
          type={'primary'}
          onClick={handleMarkJob}
          block
        >
          <FormattedMessage id={`pages.dao.home.step.mark_job`} />
        </AccessButton>
      </Tooltip>
    );
  }, [current, currentCycle?.datum?.endAt, daoId, intl]);

  const endJobButton = useMemo(() => {
    const handlerEndJob = () => {
      updateDaoLastCycleStepMutation({
        variables: { daoId, nextStatus: UpdateDaoLastCycleStepEnum.Pair },
      });
    };
    return (
      <Popconfirm
        placement="right"
        title={intl.formatMessage({ id: 'pages.dao.home.step.end_job.tips' })}
        onConfirm={handlerEndJob}
        disabled={currentCycle?.jobs?.total === undefined || currentCycle?.jobs?.total === 0}
        okButtonProps={{ loading: mutationUpdateDaoLastCycleStepResult.loading }}
      >
        <Button
          size={'large'}
          block
          disabled={currentCycle?.jobs?.total === undefined || currentCycle?.jobs?.total === 0}
          loading={mutationUpdateDaoLastCycleStepResult.loading || false}
        >
          <FormattedMessage id={`pages.dao.home.step.end_job`} />
        </Button>
      </Popconfirm>
    );
  }, [
    currentCycle?.jobs?.total,
    daoId,
    intl,
    mutationUpdateDaoLastCycleStepResult.loading,
    updateDaoLastCycleStepMutation,
  ]);

  const pairingButton = useMemo(() => {
    if (!currentCycle) return <></>;
    return <StepPairing refetch={refetch} currentCycle={currentCycle} />;
  }, [currentCycle, refetch]);

  const endPairButton = useMemo(() => {
    const handlerEndPair = () => {
      updateDaoLastCycleStepMutation({
        variables: { daoId, nextStatus: UpdateDaoLastCycleStepEnum.Vote },
      });
    };
    const disableEndPair = !currentCycle?.datum?.pairedAt || false;
    return (
      <Popconfirm
        placement="right"
        title={intl.formatMessage({ id: 'pages.dao.home.step.end_pair.tips' })}
        onConfirm={handlerEndPair}
        disabled={disableEndPair}
        okButtonProps={{ loading: mutationUpdateDaoLastCycleStepResult.loading }}
      >
        <Button
          size={'large'}
          block
          disabled={disableEndPair}
          loading={mutationUpdateDaoLastCycleStepResult.loading || false}
        >
          <FormattedMessage id={`pages.dao.home.step.end_pair`} />
        </Button>
      </Popconfirm>
    );
  }, [
    currentCycle?.datum?.pairedAt,
    daoId,
    intl,
    mutationUpdateDaoLastCycleStepResult.loading,
    updateDaoLastCycleStepMutation,
  ]);

  const goVoteButton = useMemo(() => {
    return (
      <Tooltip placement="right" title={goVoteButtonTipTitle}>
        <AccessButton
          allow={AccessEnum.PREICPPER}
          size={'large'}
          type={'primary'}
          danger
          disabled={current !== CycleStepEnum.Vote}
          onClick={handleGoVote}
          block
        >
          <FormattedMessage id={`pages.dao.home.button.vote`} />
        </AccessButton>
      </Tooltip>
    );
  }, [current, goVoteButtonTipTitle, handleGoVote]);

  const endVoteButton = useMemo(() => {
    const handlerEndVote = () => {
      updateDaoLastCycleStepMutation({
        variables: { daoId, nextStatus: UpdateDaoLastCycleStepEnum.VoteEnd },
      });
    };
    return (
      <Popconfirm
        placement="right"
        title={intl.formatMessage({ id: 'pages.dao.home.step.end_vote.tips' })}
        onConfirm={handlerEndVote}
        okButtonProps={{ loading: mutationUpdateDaoLastCycleStepResult.loading }}
      >
        <Button
          size={'large'}
          block
          loading={mutationUpdateDaoLastCycleStepResult.loading || false}
        >
          <FormattedMessage id={`pages.dao.home.step.end_vote`} />
        </Button>
      </Popconfirm>
    );
  }, [daoId, intl, mutationUpdateDaoLastCycleStepResult.loading, updateDaoLastCycleStepMutation]);

  // const voteOpButton = useMemo(() => {
  //   if (!currentCycle) return <></>;
  //   return <StepStat currentCycle={currentCycle} />;
  // }, [currentCycle]);

  const buttons = useMemo(() => {
    if (current === CycleStepEnum.Job) {
      return (
        <Row justify={'center'} gutter={60} style={{ marginTop: '50px', marginBottom: '50px' }}>
          <Col span={5}>{markJobButton}</Col>
        </Row>
      );
    }
    if (current === CycleStepEnum.Vote) {
      return (
        <Row justify={'center'} gutter={60} style={{ marginTop: '50px', marginBottom: '50px' }}>
          <Col span={5}>{goVoteButton}</Col>
        </Row>
      );
    }
    return <></>;
  }, [current, goVoteButton, markJobButton]);

  const ownerButtons = useMemo(() => {
    if (current === CycleStepEnum.Job) {
      return (
        <Row justify={'center'} gutter={60} style={{ marginTop: '50px', marginBottom: '50px' }}>
          <Col span={5}>{markJobButton}</Col>
          <Col span={5}>{endJobButton}</Col>
        </Row>
      );
    }
    if (current === CycleStepEnum.Pair) {
      return (
        <Row justify={'center'} gutter={60} style={{ marginTop: '50px', marginBottom: '50px' }}>
          <Col span={5}>{pairingButton}</Col>
          <Col span={5}>{endPairButton}</Col>
        </Row>
      );
    }
    if (current === CycleStepEnum.Vote) {
      return (
        <Row justify={'center'} gutter={60} style={{ marginTop: '50px', marginBottom: '50px' }}>
          <Col span={5}>{goVoteButton}</Col>
          <Col span={5}>{endVoteButton}</Col>
        </Row>
      );
    }
    // if (current === CycleStepEnum.VoteEnd) {
    //   return (
    //     <Row justify={'center'} gutter={60} style={{ marginTop: '50px', marginBottom: '50px' }}>
    //       <Col span={8}>{voteOpButton}</Col>
    //     </Row>
    //   );
    // }
    return <></>;
  }, [
    current,
    endJobButton,
    endPairButton,
    endVoteButton,
    goVoteButton,
    markJobButton,
    pairingButton,
  ]);

  const handlerStepStatus = useCallback(
    (i: number) => {
      if (currentIndex[current] === i) return 'process';
      if (currentIndex[current] > i) return 'finish';
      return 'wait';
    },
    [current],
  );

  const stepJobDesc = useMemo(() => {
    let res = '';
    if (currentCycle?.datum?.beginAt !== undefined)
      res += getFormatTime(currentCycle?.datum?.beginAt, 'L');
    if (currentCycle?.datum?.endAt !== undefined)
      res += ` - ${getFormatTime(currentCycle?.datum?.endAt, 'L')}`;
    return res;
  }, [currentCycle?.datum?.beginAt, currentCycle?.datum?.endAt]);

  const stepPairDesc = useMemo(() => {
    let res = '';
    if (currentCycle?.datum?.pairBeginAt !== undefined)
      res += getFormatTime(currentCycle?.datum?.pairBeginAt, 'L');
    if (currentCycle?.datum?.pairEndAt !== undefined)
      res += ` - ${getFormatTime(currentCycle?.datum?.pairEndAt, 'L')}`;
    return res;
  }, [currentCycle?.datum?.pairBeginAt, currentCycle?.datum?.pairEndAt]);

  const stepVoteDesc = useMemo(() => {
    let res = '';
    if (currentCycle?.datum?.voteBeginAt !== undefined)
      res += getFormatTime(currentCycle?.datum?.voteBeginAt, 'L');
    if (currentCycle?.datum?.voteEndAt !== undefined)
      res += ` - ${getFormatTime(currentCycle?.datum?.voteEndAt, 'L')}`;
    return res;
  }, [currentCycle?.datum?.voteBeginAt, currentCycle?.datum?.voteEndAt]);

  if (loading) return <Skeleton active />;

  return (
    <>
      <Row justify={'space-between'}>
        <Steps type="navigation" current={currentIndex[current]} onChange={() => {}}>
          <Step
            title={CycleStepEnum.Job}
            status={handlerStepStatus(0)}
            description={stepJobDesc}
            icon={current === CycleStepEnum.Job && <Loading3QuartersOutlined />}
          />
          <Step
            title={CycleStepEnum.Pair}
            status={handlerStepStatus(1)}
            description={stepPairDesc}
            icon={current === CycleStepEnum.Pair && <Loading3QuartersOutlined />}
          />
          <Step
            title={CycleStepEnum.Vote}
            status={handlerStepStatus(2)}
            description={stepVoteDesc}
            icon={current === CycleStepEnum.Vote && <Loading3QuartersOutlined />}
          />
        </Steps>
      </Row>
      {isOwner ? ownerButtons : buttons}
    </>
  );
};

export default DaoStepStatus;
