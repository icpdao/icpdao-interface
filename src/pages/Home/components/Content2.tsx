import React, { useMemo } from 'react';
import styles from '../index.less';
import { useIntl } from 'umi';
import { Row, Col } from 'antd';
import type { HomeStats } from '@/services/dao/generated';
import TweenOne from 'rc-tween-one';
import { OverPack } from 'rc-scroll-anim';

const Children = require('rc-tween-one/lib/plugin/ChildrenPlugin');

TweenOne.plugins.push(Children);

const cardValueShort = (value: number) => {
  // if (value >= 1000000) return {value: value / 10000, suffix: 'M'}
  if (value >= 10000) return { value: value / 1000, suffix: 'K' };
  return { value, suffix: '' };
};

const statisticValueFormat = (
  title: string,
  value: number,
  unit: string = '',
  formatMoney: boolean = false,
) => {
  const { value: shortValue, suffix } = cardValueShort(value);
  const animationArgs: any = {
    Children: { value: shortValue, floatLength: 0 },
    duration: 1000,
  };
  if (formatMoney) {
    animationArgs.Children.formatMoney = { thousand: ',', decimal: '.' };
    animationArgs.Children.floatLength = 1;
  }
  return (
    <div key={title}>
      <div className={styles.P2StatValue} key={`${title}Number`}>
        <div>{unit}</div>
        <TweenOne animation={animationArgs} key={`${title}Value`} style={{ whiteSpace: 'nowrap' }}>
          0
        </TweenOne>
        {!!suffix && (
          <>
            <div>{suffix}</div>
            <span className={styles.P2StatSuffix}>+</span>
          </>
        )}
      </div>
      <div className={styles.P2StatTitle} key={`${title}Title`}>
        {title}
      </div>
    </div>
  );
};

type HomeProps = {
  statsData: HomeStats | undefined | null;
  incomePrices: number;
};

const Content2: React.FC<HomeProps> = ({ statsData, incomePrices }) => {
  const intl = useIntl();

  const statCards = useMemo(() => {
    return (
      <OverPack>
        <Row className={styles.P2} justify={'center'} key={'statCards'}>
          <Col span={16} key={'cardWidth'}>
            <Row gutter={16} key={'cardContent'}>
              <Col xs={24} lg={6} key={'card1'}>
                {statisticValueFormat(
                  intl.formatMessage({ id: 'component.card.stat.dao' }),
                  statsData?.dao || 0,
                )}
              </Col>
              <Col xs={24} lg={6} key={'card2'}>
                {statisticValueFormat(
                  intl.formatMessage({ id: 'component.card.stat.icpper' }),
                  statsData?.icpper || 0,
                )}
              </Col>
              <Col xs={24} lg={6} key={'card3'}>
                {statisticValueFormat(
                  intl.formatMessage({ id: 'component.card.stat.size' }),
                  parseFloat(statsData?.size || '0') || 0,
                )}
              </Col>
              <Col xs={24} lg={6} key={'card4'}>
                {statisticValueFormat(
                  intl.formatMessage({ id: 'component.card.stat.income' }),
                  incomePrices || 0,
                  '$',
                  true,
                )}
              </Col>
            </Row>
          </Col>
        </Row>
      </OverPack>
    );
  }, [incomePrices, intl, statsData?.dao, statsData?.icpper, statsData?.size]);
  return <div className={styles.ContentTwo}>{statCards}</div>;
};

export default Content2;
