import React from 'react';
import QueueAnim from 'rc-queue-anim';
import ScrollAnim from 'rc-scroll-anim';
import styles from '../index.less';
import Texty from 'rc-texty';
import { useIntl } from 'umi';
import { Col, Row, Space } from 'antd';
import IconFont from '@/components/IconFont';

const Content4: React.FC = () => {
  const intl = useIntl();
  return (
    <div className={styles.ContentFive}>
      <ScrollAnim.OverPack id="contactCards">
        <div className={styles.P10}>
          <Texty type={'top'} mode={'sync'} split={(v) => v.split(' ').map((s) => `${s} `)}>
            {intl.formatMessage({ id: 'pages.home.p10' })}
          </Texty>
        </div>
        <div className={styles.P11}>
          <Texty
            type={'top'}
            mode={'sync'}
            className={styles.P11Title}
            split={(v) => v.split(' ').map((s) => `${s} `)}
          >
            {intl.formatMessage({ id: 'pages.home.p11' })}
          </Texty>
        </div>
        <QueueAnim delay={300} interval={600} type={'bottom'} key="contactQueueAnim">
          <Row key={'contactCards'} justify={'center'}>
            <Col span={16}>
              <Row justify={'space-between'} className={styles.P12}>
                <Col xs={23} sm={11} lg={5} className={styles.P12Card}>
                  <a
                    href="https://twitter.com/icpdao"
                    style={{ color: 'inherit' }}
                    target={'_blank'}
                  >
                    <Space direction={'vertical'}>
                      <div className={styles.P12Icon}>
                        <IconFont type={`icon-twitter`} />
                      </div>
                      <div className={styles.P12Title}>Twitter</div>
                      <div className={styles.P12Desc}>
                        {intl.formatMessage({ id: 'pages.home.p12.0' })}
                      </div>
                    </Space>
                  </a>
                </Col>
                <Col xs={23} sm={11} lg={5} className={styles.P12Card}>
                  <a
                    href="https://discord.com/invite/yz7AWVdRmj"
                    style={{ color: 'inherit' }}
                    target={'_blank'}
                  >
                    <Space direction={'vertical'}>
                      <div className={styles.P12Icon}>
                        <IconFont type={`icon-discord`} />
                      </div>
                      <div className={styles.P12Title}>Discord</div>
                      <div className={styles.P12Desc}>
                        {intl.formatMessage({ id: 'pages.home.p12.1' })}
                      </div>
                    </Space>
                  </a>
                </Col>
                <Col xs={23} sm={11} lg={5} className={styles.P12Card}>
                  <a
                    href="mailto:icpdao06@gmail.com"
                    style={{ color: 'inherit' }}
                    target={'_blank'}
                  >
                    <Space direction={'vertical'}>
                      <div className={styles.P12Icon}>
                        <IconFont type={`icon-gmail`} />
                      </div>
                      <div className={styles.P12Title}>Gmail</div>
                      <div className={styles.P12Desc}>
                        {intl.formatMessage({ id: 'pages.home.p12.2' })}
                      </div>
                    </Space>
                  </a>
                </Col>
                <Col xs={23} sm={11} lg={5} className={styles.P12Card}>
                  <a
                    href="https://www.youtube.com/channel/UC9vo3RcUbA6V4V6ouYR8nqg"
                    style={{ color: 'inherit' }}
                    target={'_blank'}
                  >
                    <Space direction={'vertical'}>
                      <div className={styles.P12Icon}>
                        <IconFont type={`icon-youtube`} />
                      </div>
                      <div className={styles.P12Title}>Youtube</div>
                      <div className={styles.P12Desc}>
                        {intl.formatMessage({ id: 'pages.home.p12.3' })}
                      </div>
                    </Space>
                  </a>
                </Col>
              </Row>
            </Col>
          </Row>
        </QueueAnim>
      </ScrollAnim.OverPack>
    </div>
  );
};

export default Content4;
