import React, { useMemo, useState } from 'react';
import styles from '../index.less';
import { useIntl, history } from 'umi';
import QueueAnim from 'rc-queue-anim';
import ScrollAnim from 'rc-scroll-anim';
import BannerAnim, { Element } from 'rc-banner-anim';
import TweenOne from 'rc-tween-one';
import { Button, Row, Col, Modal } from 'antd';
import homeImage2 from '../../../assets/image/home-image-2.png';
import homeImage3 from '../../../assets/image/home-image-3.png';
import homeImage4 from '../../../assets/image/home-image-4.png';
import type { HomeStats } from '@/services/dao/generated';

const { BgElement } = Element;

const statisticValueFormat = (title: string, value: string | number, unit: string = '') => {
  return (
    <div>
      <div className={styles.P2StatValue}>
        {value}
        {unit}
        <span className={styles.P2StatSuffix}>+</span>
      </div>
      <div className={styles.P2StatTitle}>{title}</div>
    </div>
  );
};

type HomeProps = {
  statsData: HomeStats | undefined;
};

const Content1: React.FC<HomeProps> = ({ statsData }) => {
  const intl = useIntl();
  const [bannerRef, setBannerRef] = useState<any>(null);
  const [currentBanner, setCurrentBanner] = useState<number>(0);
  const [videoModalVisible, setVideoModalVisible] = useState<boolean>(false);
  const statCards = useMemo(() => {
    return (
      <div key={'statCards'} className={styles.P2}>
        {statisticValueFormat(
          intl.formatMessage({ id: 'component.card.stat.dao' }),
          statsData?.dao || 0,
        )}
        {statisticValueFormat(
          intl.formatMessage({ id: 'component.card.stat.icpper' }),
          statsData?.icpper || 0,
        )}
        {statisticValueFormat(
          intl.formatMessage({ id: 'component.card.stat.size' }),
          parseFloat(statsData?.size) || 0,
        )}
        {statisticValueFormat(
          intl.formatMessage({ id: 'component.card.stat.income' }),
          parseFloat(statsData?.income) || 0,
        )}
      </div>
    );
  }, [intl, statsData?.dao, statsData?.icpper, statsData?.income, statsData?.size]);
  return (
    <div className={styles.ContentTwo}>
      <Modal
        maskClosable={true}
        bodyStyle={{
          paddingTop: 62,
          textAlign: 'center',
          fontWeight: 400,
          padding: '8px 8px 0 8px',
        }}
        destroyOnClose={true}
        width={800}
        visible={videoModalVisible}
        footer={null}
        onOk={() => setVideoModalVisible(false)}
        onCancel={() => setVideoModalVisible(false)}
      >
        <iframe
          width="100%"
          height="450px"
          src="https://www.youtube.com/embed/i7FSv9tIhqs?controls=0"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </Modal>
      <ScrollAnim.OverPack id="statCards">
        <QueueAnim delay={300} interval={600} type={'left'} key="statQueueAnim">
          {statCards}
          <div key={'introduceBanner'}>
            <BannerAnim
              type={'across'}
              prefixCls={styles.P3}
              ref={setBannerRef}
              onChange={(_, current) => {
                setCurrentBanner(current);
              }}
            >
              <Element prefixCls={styles.P3Content} key="0">
                <BgElement key="bg0" className={styles.P3ContentBg} />
                <TweenOne animation={{ y: 30, opacity: 0, type: 'from' }}>
                  <Row className={styles.P3ContentLayout} justify={'center'}>
                    <Col span={9} className={styles.P3ContentLeft}>
                      <div className={styles.P3ContentLeftTitle}>
                        {intl.formatMessage({ id: 'pages.home.p3.0.title' })}
                      </div>
                      <div className={styles.P3ContentLeftLine} />
                      <div className={styles.P3ContentLeftDesc}>
                        {intl.formatMessage({ id: 'pages.home.p3.0.desc' })}
                      </div>
                      <div>
                        <Button
                          type="primary"
                          size="large"
                          onClick={() => history.push('/dao/explore')}
                        >
                          {intl.formatMessage({ id: 'pages.dao.component.dao_list.create_dao' })}
                        </Button>
                      </div>
                    </Col>
                    <Col span={6} className={styles.P3ContentRight}>
                      <img style={{ height: '250px' }} alt={'homeImage2'} src={homeImage2} />
                    </Col>
                  </Row>
                </TweenOne>
              </Element>
              <Element prefixCls={styles.P3Content} key="1">
                <BgElement key="bg1" className={styles.P3ContentBg} />
                <TweenOne animation={{ y: 30, opacity: 0, type: 'from' }}>
                  <Row className={styles.P3ContentLayout} justify={'center'}>
                    <Col span={9} className={styles.P3ContentLeft}>
                      <div className={styles.P3ContentLeftTitle}>
                        {intl.formatMessage({ id: 'pages.home.p3.1.title' })}
                      </div>
                      <div className={styles.P3ContentLeftLine} />
                      <div className={styles.P3ContentLeftDesc}>
                        {intl.formatMessage({ id: 'pages.home.p3.1.desc' })}
                      </div>
                      <div>
                        <Button
                          type="primary"
                          size="large"
                          onClick={() => history.push('/dao/explore')}
                        >
                          {intl.formatMessage({ id: 'pages.dao.component.dao_list.create_dao' })}
                        </Button>
                      </div>
                    </Col>
                    <Col span={6} className={styles.P3ContentRight}>
                      <img
                        onClick={() => setVideoModalVisible(true)}
                        style={{ height: '250px', cursor: 'pointer' }}
                        alt={'homeImage4'}
                        src={homeImage4}
                      />
                    </Col>
                  </Row>
                </TweenOne>
              </Element>
              <Element prefixCls={styles.P3Content} key="2">
                <BgElement key="bg2" className={styles.P3ContentBg} />
                <TweenOne animation={{ y: 30, opacity: 0, type: 'from' }}>
                  <Row className={styles.P3ContentLayout} justify={'center'}>
                    <Col span={9} className={styles.P3ContentLeft}>
                      <div className={styles.P3ContentLeftTitle}>
                        {intl.formatMessage({ id: 'pages.home.p3.2.title' })}
                      </div>
                      <div className={styles.P3ContentLeftLine} />
                      <div className={styles.P3ContentLeftDesc}>
                        {intl.formatMessage({ id: 'pages.home.p3.2.desc' })}
                      </div>
                      <div>
                        <Button
                          type="primary"
                          size="large"
                          onClick={() => history.push('/dao/explore')}
                        >
                          {intl.formatMessage({ id: 'pages.dao.component.dao_list.create_dao' })}
                        </Button>
                      </div>
                    </Col>
                    <Col span={6} className={styles.P3ContentRight}>
                      <img
                        onClick={() => window.open('https://g.icpdao.co/', '_blank')}
                        style={{ height: '250px', cursor: 'pointer' }}
                        alt={'homeImage3'}
                        src={homeImage3}
                      />
                    </Col>
                  </Row>
                </TweenOne>
              </Element>
            </BannerAnim>
          </div>
          <Row className={styles.P4} key="introduceBannerButton" justify={'center'} gutter={80}>
            <Col>
              <div
                className={`${styles.P4Button} ${currentBanner === 0 && styles.P4ButtonHover}`}
                onClick={() => {
                  bannerRef?.slickGoTo(0);
                  setCurrentBanner(0);
                }}
              >
                <div>{intl.formatMessage({ id: 'pages.home.p4.0' })}</div>
              </div>
            </Col>
            <Col>
              <div
                className={`${styles.P4Button} ${currentBanner === 1 && styles.P4ButtonHover}`}
                onClick={() => {
                  bannerRef?.slickGoTo(1);
                  setCurrentBanner(1);
                }}
              >
                <div>{intl.formatMessage({ id: 'pages.home.p4.1' })}</div>
              </div>
            </Col>
            <Col>
              <div
                className={`${styles.P4Button} ${currentBanner === 2 && styles.P4ButtonHover}`}
                onClick={() => {
                  bannerRef?.slickGoTo(2);
                  setCurrentBanner(2);
                }}
              >
                <div>{intl.formatMessage({ id: 'pages.home.p4.2' })}</div>
              </div>
            </Col>
          </Row>
        </QueueAnim>
      </ScrollAnim.OverPack>
    </div>
  );
};

export default Content1;
