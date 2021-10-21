import React from 'react';
import { Button, Col, Row } from 'antd';
import styles from '../index.less';
import { FormattedMessage } from '@@/plugin-locale/localeExports';
import { history } from '@@/core/history';
import AccessButton from '@/components/AccessButton';
import { AccessEnum } from '@/access';
import { useCallback } from 'react';
import Texty from 'rc-texty';
import { useIntl } from 'umi';
import QueueAnim from 'rc-queue-anim';

const Content0: React.FC<{ openModal: () => void }> = ({ openModal }) => {
  const intl = useIntl();
  const handleMarkJob = useCallback(() => {
    history.push('/job');
  }, []);
  return (
    <div className={styles.ContentOne} key={'p1'}>
      <Row justify={'center'}>
        <Col span={16} className={styles.POne}>
          <div className={styles.p1Title}>
            <Texty type={'left'} delay={100} split={(v) => v.split(' ').map((s) => `${s} `)}>
              {intl.formatMessage({ id: 'pages.home.p1' })}
            </Texty>
          </div>
          <div className={styles.p1Content}>
            <Texty type={'left'} delay={400} split={(v) => v.split(' ').map((s) => `${s} `)}>
              {intl.formatMessage({ id: 'pages.home.p2' })}
            </Texty>
          </div>
          <QueueAnim
            delay={500}
            duration={1000}
            type={'left'}
            onEnd={() => {
              openModal();
            }}
          >
            <Row className={styles.p1Buttons} gutter={16} key={'p1Buttons'}>
              <Col key={'p1Explore'}>
                <Button
                  style={{ width: '11.5rem', marginBottom: '2rem' }}
                  key="exploreDao"
                  size={'large'}
                  type="primary"
                  block
                  onClick={() => history.push('/dao/explore')}
                >
                  <FormattedMessage id={'pages.home.button1'} />
                </Button>
              </Col>
              <Col key={'p1Job'}>
                <AccessButton
                  style={{ width: '11.5rem', marginBottom: '2rem' }}
                  key="markJob"
                  allow={AccessEnum.NOMARL}
                  size={'large'}
                  type="primary"
                  block
                  onClick={handleMarkJob}
                >
                  <FormattedMessage id={'pages.home.button2'} />
                </AccessButton>
              </Col>
            </Row>
          </QueueAnim>
        </Col>
      </Row>
    </div>
  );
};

export default Content0;
