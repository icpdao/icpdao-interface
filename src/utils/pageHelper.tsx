import type { IcpperStatQuery } from '@/services/dao/generated';
import { getEIColor } from '@/utils/utils';
import { Tooltip } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';

export const colorTooltip = (color: string, tipsText: string) => {
  if (tipsText === '') return <></>;
  return (
    <Tooltip placement="right" title={tipsText}>
      <ExclamationCircleFilled style={{ color, fontSize: 18, marginLeft: 10 }} />
    </Tooltip>
  );
};

export const renderSize = (intl: any, record: IcpperStatQuery) => {
  if (!record?.datum?.size) return <>-</>;
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
      <span style={{ color }}>{record.datum?.size}</span>
      {colorTooltip(color, tipsText)}
    </>
  );
};

export const renderEi = (intl: any, record: IcpperStatQuery) => {
  if (!record?.datum?.ei) {
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
