import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Col, Row, Skeleton, Steps, Tooltip } from 'antd';
import {
  CycleQuery,
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
import StepStat from '@/pages/Dao/components/step/stat';
import { LoadingOutlined } from '@ant-design/icons';

const { Step } = Steps;

const currentIndex = {
  [CycleStepEnum.Job]: 0,
  [CycleStepEnum.Pair]: 1,
  [CycleStepEnum.Vote]: 2,
  [CycleStepEnum.VoteEnd]: 3,
};

const DaoStepStatus: React.FC<{ daoId: string; isOwner: boolean }> = ({ daoId, isOwner }) => {
  const intl = useIntl();
  const { data, loading } = useDaoLastCycleStatusQuery({ variables: { daoId } });
  const [currentCycle, setCurrentCycle] = useState<CycleQuery>();
  const [updateDaoLastCycleStepMutation, mutationUpdateDaoLastCycleStepResult] =
    useUpdateDaoLastCycleStepMutation();

  useEffect(() => {
    if (!data?.dao?.lastCycle) return;
    setCurrentCycle(data?.dao?.lastCycle as CycleQuery);
  }, [data?.dao?.lastCycle]);

  useEffect(() => {
    if (!mutationUpdateDaoLastCycleStepResult.data?.updateDaoLastCycleStep?.dao?.lastCycle) return;
    setCurrentCycle(
      mutationUpdateDaoLastCycleStepResult.data?.updateDaoLastCycleStep.dao.lastCycle,
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
      <Tooltip
        placement="right"
        title={intl.formatMessage({ id: 'pages.dao.home.step.end_job.tips' })}
      >
        <Button
          size={'large'}
          onClick={handlerEndJob}
          block
          disabled={!currentCycle?.datum?.beginAt}
          loading={mutationUpdateDaoLastCycleStepResult.loading || false}
        >
          <FormattedMessage id={`pages.dao.home.step.end_job`} />
        </Button>
      </Tooltip>
    );
  }, [daoId, intl, mutationUpdateDaoLastCycleStepResult.loading, updateDaoLastCycleStepMutation]);

  const pairingButton = useMemo(() => {
    if (!currentCycle) return <></>;
    return <StepPairing currentCycle={currentCycle} />;
  }, [currentCycle]);

  const endPairButton = useMemo(() => {
    const handlerEndPair = () => {
      updateDaoLastCycleStepMutation({
        variables: { daoId, nextStatus: UpdateDaoLastCycleStepEnum.Vote },
      });
    };
    return (
      <Tooltip
        placement="right"
        title={intl.formatMessage({ id: 'pages.dao.home.step.end_pair.tips' })}
      >
        <Button
          size={'large'}
          onClick={handlerEndPair}
          block
          loading={mutationUpdateDaoLastCycleStepResult.loading || false}
        >
          <FormattedMessage id={`pages.dao.home.step.end_pair`} />
        </Button>
      </Tooltip>
    );
  }, [daoId, intl, mutationUpdateDaoLastCycleStepResult.loading, updateDaoLastCycleStepMutation]);

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
      <Tooltip
        placement="right"
        title={intl.formatMessage({ id: 'pages.dao.home.step.end_vote.tips' })}
      >
        <Button
          size={'large'}
          onClick={handlerEndVote}
          block
          loading={mutationUpdateDaoLastCycleStepResult.loading || false}
        >
          <FormattedMessage id={`pages.dao.home.step.end_vote`} />
        </Button>
      </Tooltip>
    );
  }, [daoId, intl, mutationUpdateDaoLastCycleStepResult.loading, updateDaoLastCycleStepMutation]);

  const voteOpButton = useMemo(() => {
    if (!currentCycle) return <></>;
    return <StepStat currentCycle={currentCycle} />;
  }, [currentCycle]);

  const buttons = useMemo(() => {
    if (current === CycleStepEnum.Job) {
      return (
        <Row justify={'center'} gutter={60} style={{ marginTop: '50px' }}>
          <Col span={5}>{markJobButton}</Col>
        </Row>
      );
    }
    if (current === CycleStepEnum.Vote) {
      return (
        <Row justify={'center'} gutter={60} style={{ marginTop: '50px' }}>
          <Col span={5}>{goVoteButton}</Col>
        </Row>
      );
    }
    return <></>;
  }, [current, goVoteButton, markJobButton]);

  const ownerButtons = useMemo(() => {
    if (current === CycleStepEnum.Job) {
      return (
        <Row justify={'center'} gutter={60} style={{ marginTop: '50px' }}>
          <Col span={5}>{markJobButton}</Col>
          <Col span={5}>{endJobButton}</Col>
        </Row>
      );
    }
    if (current === CycleStepEnum.Pair) {
      return (
        <Row justify={'center'} gutter={60} style={{ marginTop: '50px' }}>
          <Col span={5}>{pairingButton}</Col>
          <Col span={5}>{endPairButton}</Col>
        </Row>
      );
    }
    if (current === CycleStepEnum.Vote) {
      return (
        <Row justify={'center'} gutter={60} style={{ marginTop: '50px' }}>
          <Col span={5}>{goVoteButton}</Col>
          <Col span={5}>{endVoteButton}</Col>
        </Row>
      );
    }
    if (current === CycleStepEnum.VoteEnd) {
      return (
        <Row justify={'center'} gutter={60} style={{ marginTop: '50px' }}>
          <Col span={8}>{voteOpButton}</Col>
        </Row>
      );
    }
    return <></>;
  }, [
    current,
    endJobButton,
    endPairButton,
    endVoteButton,
    goVoteButton,
    markJobButton,
    pairingButton,
    voteOpButton,
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
    if (currentCycle?.datum?.beginAt) res += getFormatTime(currentCycle?.datum?.beginAt, 'LL');
    if (currentCycle?.datum?.endAt) res += ` - ${getFormatTime(currentCycle?.datum?.endAt, 'LL')}`;
    return res;
  }, [currentCycle?.datum?.beginAt, currentCycle?.datum?.endAt]);

  const stepPairDesc = useMemo(() => {
    let res = '';
    if (currentCycle?.datum?.pairBeginAt)
      res += getFormatTime(currentCycle?.datum?.pairBeginAt, 'LL');
    if (currentCycle?.datum?.pairEndAt)
      res += ` - ${getFormatTime(currentCycle?.datum?.pairEndAt, 'LL')}`;
    return res;
  }, [currentCycle?.datum?.pairBeginAt, currentCycle?.datum?.pairEndAt]);

  const stepVoteDesc = useMemo(() => {
    let res = '';
    if (currentCycle?.datum?.voteBeginAt)
      res += getFormatTime(currentCycle?.datum?.voteBeginAt, 'LL');
    if (currentCycle?.datum?.voteEndAt)
      res += ` - ${getFormatTime(currentCycle?.datum?.voteEndAt, 'LL')}`;
    return res;
  }, [currentCycle?.datum?.voteBeginAt, currentCycle?.datum?.voteEndAt]);

  const stepVoteEndDesc = useMemo(() => {
    let res = '';
    if (currentCycle?.datum?.voteEndAt)
      res += `Cycle End: ${getFormatTime(currentCycle?.datum?.voteEndAt, 'LL')}`;
    return res;
  }, [currentCycle?.datum?.voteEndAt]);

  if (loading) return <Skeleton active />;

  return (
    <>
      <Row justify={'space-between'}>
        <Steps type="navigation" current={currentIndex[current]} onChange={() => {}}>
          <Step
            title={CycleStepEnum.Job}
            status={handlerStepStatus(0)}
            description={stepJobDesc}
            icon={current === CycleStepEnum.Job && <LoadingOutlined />}
          />
          <Step
            title={CycleStepEnum.Pair}
            status={handlerStepStatus(1)}
            description={stepPairDesc}
            icon={current === CycleStepEnum.Pair && <LoadingOutlined />}
          />
          <Step
            title={CycleStepEnum.Vote}
            status={handlerStepStatus(2)}
            description={stepVoteDesc}
            icon={current === CycleStepEnum.Vote && <LoadingOutlined />}
          />
          <Step
            title={CycleStepEnum.VoteEnd}
            status={handlerStepStatus(3)}
            description={stepVoteEndDesc}
            icon={current === CycleStepEnum.VoteEnd && <LoadingOutlined />}
          />
        </Steps>
      </Row>
      {isOwner ? ownerButtons : buttons}
    </>
  );
};

export default DaoStepStatus;
