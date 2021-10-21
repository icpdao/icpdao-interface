import React, { useState } from 'react';
import styles from '../index.less';
import { useIntl } from 'umi';
import QueueAnim from 'rc-queue-anim';
import BannerAnim, { Element } from 'rc-banner-anim';
import TweenOne from 'rc-tween-one';
import { Row, Col, Modal } from 'antd';
import AccessButton from '@/components/AccessButton';
import { AccessEnum } from '@/access';
import { history } from '@@/core/history';
import homeImage2 from '@/assets/image/home-image-2.png';
import homeImage4 from '@/assets/image/home-image-4.png';
import homeImage3 from '@/assets/image/home-image-3.png';

const { BgElement } = Element;

const Content1: React.FC = () => {
  const intl = useIntl();
  const [bannerRef, setBannerRef] = useState<any>(null);
  const [currentBanner, setCurrentBanner] = useState<number>(0);
  const [videoModalVisible, setVideoModalVisible] = useState<boolean>(false);

  return (
    <div className={styles.ContentThree}>
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
      <QueueAnim delay={300} interval={600} type={'left'} key="introduceQueueAnim">
        <div key={'introduceBanner'}>
          <BannerAnim
            autoPlay
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
                  <Col span={16}>
                    <Row justify={'center'}>
                      <Col xs={24} lg={10} className={styles.P3ContentLeft}>
                        <div className={styles.P3ContentLeftTitle}>
                          {intl.formatMessage({ id: 'pages.home.p3.0.title' })}
                        </div>
                        <div className={styles.P3ContentLeftLine} />
                        <div className={styles.P3ContentLeftDesc}>
                          {intl.formatMessage({ id: 'pages.home.p3.0.desc' })}
                        </div>
                        <div>
                          <AccessButton
                            allow={AccessEnum.NOMARL}
                            type="primary"
                            size="large"
                            onClick={() => history.push('/dao/create')}
                          >
                            {intl.formatMessage({
                              id: 'pages.dao.component.dao_list.create_dao',
                            })}
                          </AccessButton>
                        </div>
                      </Col>
                      <Col xs={0} lg={12} className={styles.P3ContentRight}>
                        <img
                          style={{ width: '431px', float: 'right' }}
                          alt={'homeImage2'}
                          src={homeImage2}
                        />
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </TweenOne>
            </Element>
            <Element prefixCls={styles.P3Content} key="1">
              <BgElement key="bg1" className={styles.P3ContentBg} />
              <TweenOne animation={{ y: 30, opacity: 0, type: 'from' }}>
                <Row className={styles.P3ContentLayout} justify={'center'}>
                  <Col span={16}>
                    <Row justify={'center'}>
                      <Col xs={24} lg={10} className={styles.P3ContentLeft}>
                        <div className={styles.P3ContentLeftTitle}>
                          {intl.formatMessage({ id: 'pages.home.p3.1.title' })}
                        </div>
                        <div className={styles.P3ContentLeftLine} />
                        <div className={styles.P3ContentLeftDesc}>
                          {intl.formatMessage({ id: 'pages.home.p3.1.desc' })}
                        </div>
                        <div>
                          <AccessButton
                            allow={AccessEnum.NOMARL}
                            type="primary"
                            size="large"
                            onClick={() => history.push('/dao/create')}
                          >
                            {intl.formatMessage({
                              id: 'pages.dao.component.dao_list.create_dao',
                            })}
                          </AccessButton>
                        </div>
                      </Col>
                      <Col xs={0} lg={12} className={styles.P3ContentRight}>
                        <img
                          onClick={() => setVideoModalVisible(true)}
                          style={{
                            width: '431px',
                            cursor: 'pointer',
                            float: 'right',
                          }}
                          alt={'homeImage4'}
                          src={homeImage4}
                        />
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </TweenOne>
            </Element>
            <Element prefixCls={styles.P3Content} key="2">
              <BgElement key="bg2" className={styles.P3ContentBg} />
              <TweenOne animation={{ y: 30, opacity: 0, type: 'from' }}>
                <Row className={styles.P3ContentLayout} justify={'center'}>
                  <Col span={16}>
                    <Row justify={'center'}>
                      <Col xs={24} lg={10} className={styles.P3ContentLeft}>
                        <div className={styles.P3ContentLeftTitle}>
                          {intl.formatMessage({ id: 'pages.home.p3.2.title' })}
                        </div>
                        <div className={styles.P3ContentLeftLine} />
                        <div className={styles.P3ContentLeftDesc}>
                          {intl.formatMessage({ id: 'pages.home.p3.2.desc' })}
                        </div>
                        <div>
                          <AccessButton
                            allow={AccessEnum.NOMARL}
                            type="primary"
                            size="large"
                            onClick={() => history.push('/dao/create')}
                          >
                            {intl.formatMessage({
                              id: 'pages.dao.component.dao_list.create_dao',
                            })}
                          </AccessButton>
                        </div>
                      </Col>
                      <Col xs={0} lg={12} className={styles.P3ContentRight}>
                        <img
                          onClick={() => window.open('https://g.icpdao.co/', '_blank')}
                          style={{
                            width: '431px',
                            cursor: 'pointer',
                            float: 'right',
                          }}
                          alt={'homeImage3'}
                          src={homeImage3}
                        />
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </TweenOne>
            </Element>
          </BannerAnim>
        </div>
        <Row className={styles.P4} key="introduceBannerButton" justify={'center'}>
          <Col span={16}>
            <Row justify={'space-between'} gutter={16}>
              <Col span={8}>
                <div
                  className={`${styles.P4Button} ${currentBanner === 0 && styles.P4ButtonHover}`}
                  onMouseEnter={() => {
                    bannerRef?.slickGoTo(0);
                    setCurrentBanner(0);
                    (TweenOne as any).ticker.clear(bannerRef?.autoPlayId);
                  }}
                  onMouseLeave={() => bannerRef?.autoPlay()}
                >
                  <div>{intl.formatMessage({ id: 'pages.home.p4.0' })}</div>
                </div>
              </Col>
              <Col span={8}>
                <div
                  className={`${styles.P4Button} ${currentBanner === 1 && styles.P4ButtonHover}`}
                  onMouseEnter={() => {
                    bannerRef?.slickGoTo(1);
                    setCurrentBanner(1);
                    (TweenOne as any).ticker.clear(bannerRef?.autoPlayId);
                  }}
                  onMouseLeave={() => bannerRef?.autoPlay()}
                >
                  <div>{intl.formatMessage({ id: 'pages.home.p4.1' })}</div>
                </div>
              </Col>
              <Col span={8}>
                <div
                  className={`${styles.P4Button} ${currentBanner === 2 && styles.P4ButtonHover}`}
                  onMouseEnter={() => {
                    bannerRef?.slickGoTo(2);
                    setCurrentBanner(2);
                    (TweenOne as any).ticker.clear(bannerRef?.autoPlayId);
                  }}
                  onMouseLeave={() => bannerRef?.autoPlay()}
                >
                  <div>{intl.formatMessage({ id: 'pages.home.p4.2' })}</div>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </QueueAnim>
    </div>
  );
};

export default Content1;
