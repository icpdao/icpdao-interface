import type { IcpperStatQuery, Maybe, TokenIncomeSchema } from '@/services/dao/generated';
import { getEIColor, getFormatTime, MaxCycleEndAt } from '@/utils/utils';
import { Tag, Tooltip } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { DaoJobConfig } from '@/services/dao/generated';
import { Token } from '@/services/subgraph-v1/generated';
import { formatUnits } from 'ethers/lib/utils';
import { BigNumber } from 'ethers';

export const colorTooltip = (color: string, tipsText: string) => {
  if (tipsText === '') return <></>;
  return (
    <Tooltip placement="right" title={tipsText}>
      <ExclamationCircleFilled style={{ color, fontSize: 18, marginLeft: 10 }} />
    </Tooltip>
  );
};

export const renderSize = (intl: any, record: IcpperStatQuery) => {
  if (record?.datum?.size === undefined || record?.datum?.size === null) return <>-</>;
  let color = '#262626';
  const tips: string[] = [];
  if (record.datum.haveTwoTimesLt08)
    tips.push(intl.formatMessage({ id: 'pages.dao.component.dao_cycle_icpper.tips.1' }));
  if (record.datum.haveTwoTimesLt04)
    tips.push(intl.formatMessage({ id: 'pages.dao.component.dao_cycle_icpper.tips.2' }));
  if (record.datum.beDeductedSizeByReview && record.datum.beDeductedSizeByReview > 0)
    tips.push(intl.formatMessage({ id: 'pages.dao.component.dao_cycle_icpper.tips.3' }));
  if (record.datum.unVotedAllVote)
    tips.push(intl.formatMessage({ id: 'pages.dao.component.dao_cycle_icpper.tips.4' }));
  const tipsText = tips.join(' ');
  if (tips.length > 0) color = '#ED6C6C';
  return (
    <>
      <span style={{ color }}>{parseFloat(record.datum?.size.toString() || '0').toFixed(1)}</span>
      {colorTooltip(color, tipsText)}
    </>
  );
};

export const renderEi = (intl: any, record: IcpperStatQuery) => {
  if (record?.datum?.ei === undefined || record.datum.ei === null) {
    return <>-</>;
  }

  const tips: string[] = [];
  let color: string = 'inherit';
  if (record.datum.ei < 0.4) {
    color = '#ED6C6C';
    tips.push(intl.formatMessage({ id: 'pages.dao.component.dao_cycle_icpper.tips.7' }));
  } else if (record.datum.ei < 0.8) {
    color = '#F1C84C';
    tips.push(intl.formatMessage({ id: 'pages.dao.component.dao_cycle_icpper.tips.6' }));
  } else if (record.datum.ei >= 1.2) {
    color = '#2CA103';
    tips.push(intl.formatMessage({ id: 'pages.dao.component.dao_cycle_icpper.tips.5' }));
  }

  if (record.beReviewerHasWarningUsers && record.beReviewerHasWarningUsers.length > 0) {
    color = '#ED6C6C';
    tips.push(
      intl.formatMessage(
        { id: 'pages.dao.component.dao_cycle_icpper.tips.8' },
        { nicknames: record.beReviewerHasWarningUsers.map((d) => d?.nickname).join(' @') },
      ),
    );
  }

  const tipsText = tips.join(' ');
  return (
    <>
      <span style={{ color: getEIColor(record.datum.ei) }}>{record.datum?.ei}</span>
      {tips.length > 0 && colorTooltip(color, tipsText)}
    </>
  );
};

export const renderJobTag = (intl: any, status: number | undefined) => {
  switch (status) {
    case 0:
      return (
        <Tooltip
          placement={'right'}
          title={intl.formatMessage({ id: 'pages.job.table.tips.awaiting_merger' })}
        >
          <Tag color="magenta">
            {intl.formatMessage({ id: 'pages.job.table.tag.awaiting_merger' })}
          </Tag>
        </Tooltip>
      );
    case 1:
      return (
        <Tooltip
          placement={'right'}
          title={intl.formatMessage({ id: 'pages.job.table.tips.merged' })}
        >
          <Tag color="orange">{intl.formatMessage({ id: 'pages.job.table.tag.merged' })}</Tag>
        </Tooltip>
      );
    case 2:
      return (
        <Tooltip
          placement={'right'}
          title={intl.formatMessage({ id: 'pages.job.table.tips.awaiting_voting' })}
        >
          <Tag color="green">
            {intl.formatMessage({ id: 'pages.job.table.tag.awaiting_voting' })}
          </Tag>
        </Tooltip>
      );
    case 3:
      return (
        <Tooltip
          placement={'right'}
          title={intl.formatMessage({ id: 'pages.job.table.tips.waiting_token' })}
        >
          <Tag color="blue">{intl.formatMessage({ id: 'pages.job.table.tag.waiting_token' })}</Tag>
        </Tooltip>
      );
    case 4:
      return (
        <Tooltip
          placement={'right'}
          title={intl.formatMessage({ id: 'pages.job.table.tips.token_released' })}
        >
          <Tag color="purple">
            {intl.formatMessage({ id: 'pages.job.table.tag.token_released' })}
          </Tag>
        </Tooltip>
      );
    default:
      return (
        <Tooltip
          placement={'right'}
          title={intl.formatMessage({ id: 'pages.job.table.tips.awaiting_merger' })}
        >
          <Tag color="magenta" />
        </Tooltip>
      );
  }
};

export const renderIncomes = (
  incomes: Maybe<TokenIncomeSchema>[],
  tokenPrice: Record<string, number>,
) => {
  let allIncome = 0;
  let allPrice = 0;
  incomes.forEach((ins) => {
    if (ins?.tokenAddress && ins?.income) {
      allIncome += ins.income;
      if (tokenPrice[ins.tokenAddress]) {
        allPrice += tokenPrice[ins.tokenAddress] * ins.income;
      }
    }
  });
  return `${allIncome.toFixed(2)}/$${allPrice.toFixed(2)}`;
};

export const renderIncomesWithD = (incomes: Maybe<TokenIncomeSchema>[]) => {
  let allIncome = 0;
  incomes.forEach((ins) => {
    if (ins?.tokenAddress && ins?.income) {
      allIncome += ins.income;
    }
  });
  return `${allIncome.toFixed(2)}`;
};

export const isManualCycle = (data: DaoJobConfig) => {
  return (
    data.existedLastCycle?.endAt === MaxCycleEndAt &&
    data.existedLastCycle.pairBeginAt === MaxCycleEndAt &&
    data.existedLastCycle.pairEndAt === MaxCycleEndAt &&
    data.existedLastCycle.voteBeginAt === MaxCycleEndAt &&
    data.existedLastCycle.voteEndAt === MaxCycleEndAt
  );
};

export const descToken = (token: Token) => {
  const desc = [];
  if (
    token.mintArgs.aDenominator === 10 &&
    token.mintArgs.bNumerator === 1 &&
    token.mintArgs.c === 0 &&
    token.mintArgs.d === 0
  ) {
    if (token.createdAtTimestamp) {
      desc.push(
        <div key={'create'}>{`- Created At: ${getFormatTime(
          parseInt(token.createdAtTimestamp, 10) || 0,
          'LL',
        )}`}</div>,
      );
    }
    if (token.mintArgs.p) {
      desc.push(
        <div key={'p'}>{`- Release ${formatUnits(
          BigNumber.from(token.mintArgs.p),
          18,
        )} per day`}</div>,
      );
    }
    if (token.mintArgs.aNumerator && token.mintArgs.bDenominator) {
      desc.push(
        <div key={'a'}>{`- Becomes ${
          token.mintArgs.aNumerator / 10
        } times the original amount every ${token.mintArgs.bDenominator} days`}</div>,
      );
    }
    if (token.lpRatio && token.lpTotalAmount) {
      desc.push(
        <div key={'lp'}>{`- Periodically provides unilateral liquidity to uniswap, at a rate of ${
          token.lpRatio
        } of mining, with a cumulative maximum of ${formatUnits(
          BigNumber.from(token.lpTotalAmount),
          18,
        )}`}</div>,
      );
    }
    if (token.mintArgs.aNumerator > 10) {
      desc.push(<div key={'maxi'}>{`- Unlimited maximum issuance`}</div>);
    } else {
      const n = (365 * 100) / token.mintArgs.bDenominator;
      const y = (365 * 100) % token.mintArgs.bDenominator;
      const a1 = parseInt(formatUnits(BigNumber.from(token.mintArgs.p), 18), 10);
      const q = token.mintArgs.aNumerator / 10;
      const nTotal = (token.mintArgs.bDenominator * a1 * (1 - q ** n)) / (1 - q);
      const total = Math.floor(nTotal + y * a1 * q ** (n - 1));
      desc.push(
        <div key={'maxi'}>{`- Maximum issuance is approximately ${total} + ${formatUnits(
          BigNumber.from(token.lpTotalAmount),
          18,
        )} (100 years)`}</div>,
      );
    }
  }
  return desc;
};
