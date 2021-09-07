import React, { useState } from 'react';
import styles from '../index.less';
import { useIntl } from 'umi';
import QueueAnim from 'rc-queue-anim';
import ScrollAnim from 'rc-scroll-anim';
import BannerAnim, { Element } from 'rc-banner-anim';
import TweenOne from 'rc-tween-one';
import { Row, Col } from 'antd';
import homeImage60 from '../../../assets/image/home-image-6-0.png';
import homeImage61 from '../../../assets/image/home-image-6-1.png';
import homeImage62 from '../../../assets/image/home-image-6-2.png';
import homeImage63 from '../../../assets/image/home-image-6-3.png';
import homeImage64 from '../../../assets/image/home-image-6-4.png';
import homeImage65 from '../../../assets/image/home-image-6-5.png';
import homeImage66 from '../../../assets/image/home-image-6-6.png';
import homeImage67 from '../../../assets/image/home-image-6-7.png';
import homeImage68 from '../../../assets/image/home-image-6-8.png';
import Texty from 'rc-texty';

const { BgElement } = Element;

const Content2: React.FC = () => {
  const intl = useIntl();
  const [bannerRef, setBannerRef] = useState<any>(null);
  const [currentBanner, setCurrentBanner] = useState<number>(0);

  return (
    <div className={styles.ContentThree}>
      <ScrollAnim.OverPack id="works">
        <Texty type={'top'} mode={'sync'} className={styles.P5}>
          {intl.formatMessage({ id: 'pages.home.p5' })}
        </Texty>
        <QueueAnim delay={300} interval={600} type={'left'} key="worksQueueAnim">
          <div key={'worksBanner'}>
            <BannerAnim
              type={'across'}
              prefixCls={styles.P6}
              ref={setBannerRef}
              onChange={(_, current) => {
                setCurrentBanner(current);
              }}
            >
              <Element prefixCls={styles.P6Content} key="0">
                <BgElement key="wg0" className={styles.P6ContentBg} />
                <TweenOne animation={{ y: 30, opacity: 0, type: 'from' }}>
                  <Row className={styles.P6ContentLayout} justify={'center'}>
                    <Col span={6} className={styles.P6ContentLeft}>
                      <img
                        alt={'homeImage60'}
                        src={homeImage60}
                        className={styles.P6ContentImage0}
                      />
                      <img
                        alt={'homeImage61'}
                        src={homeImage61}
                        className={styles.P6ContentImage1}
                      />
                      <img
                        alt={'homeImage62'}
                        src={homeImage62}
                        className={styles.P6ContentImage2}
                      />
                    </Col>
                    <Col span={6} className={styles.P6ContentRight}>
                      <div className={styles.P6ContentRightTitle}>
                        {intl.formatMessage({ id: 'pages.home.p6.0.title' })}
                      </div>
                      <div className={styles.P6ContentRightLine} />
                      <div className={styles.P6ContentRightDesc}>
                        {intl.formatMessage({ id: 'pages.home.p6.0.desc' })}
                      </div>
                    </Col>
                  </Row>
                </TweenOne>
              </Element>
              <Element prefixCls={styles.P6Content} key="1">
                <BgElement key="wg1" className={styles.P6ContentBg} />
                <TweenOne animation={{ y: 30, opacity: 0, type: 'from' }}>
                  <Row className={styles.P6ContentLayout} justify={'center'}>
                    <Col span={6} className={styles.P6ContentLeft}>
                      <img
                        alt={'homeImage63'}
                        src={homeImage63}
                        className={styles.P6ContentImage3}
                      />
                    </Col>
                    <Col span={6} className={styles.P6ContentRight}>
                      <div className={styles.P6ContentRightTitle}>
                        {intl.formatMessage({ id: 'pages.home.p6.1.title' })}
                      </div>
                      <div className={styles.P6ContentRightLine} />
                      <div className={styles.P6ContentRightDesc}>
                        {intl.formatMessage({ id: 'pages.home.p6.1.desc' })}
                      </div>
                    </Col>
                  </Row>
                </TweenOne>
              </Element>
              <Element prefixCls={styles.P6Content} key="2">
                <BgElement key="wg2" className={styles.P6ContentBg} />
                <TweenOne animation={{ y: 30, opacity: 0, type: 'from' }}>
                  <Row className={styles.P6ContentLayout} justify={'center'}>
                    <Col span={6} className={styles.P6ContentLeft}>
                      <img
                        alt={'homeImage64'}
                        src={homeImage64}
                        className={styles.P6ContentImage4}
                      />
                      <img
                        alt={'homeImage65'}
                        src={homeImage65}
                        className={styles.P6ContentImage5}
                      />
                    </Col>
                    <Col span={6} className={styles.P6ContentRight}>
                      <div className={styles.P6ContentRightTitle}>
                        {intl.formatMessage({ id: 'pages.home.p6.2.title' })}
                      </div>
                      <div className={styles.P6ContentRightLine} />
                      <div className={styles.P6ContentRightDesc}>
                        {intl.formatMessage({ id: 'pages.home.p6.2.desc' })}
                      </div>
                    </Col>
                  </Row>
                </TweenOne>
              </Element>
              <Element prefixCls={styles.P6Content} key="3">
                <BgElement key="wg3" className={styles.P6ContentBg} />
                <TweenOne animation={{ y: 30, opacity: 0, type: 'from' }}>
                  <Row className={styles.P6ContentLayout} justify={'center'}>
                    <Col span={6} className={styles.P6ContentLeft}>
                      <img
                        alt={'homeImage66'}
                        src={homeImage66}
                        className={styles.P6ContentImage6}
                      />
                    </Col>
                    <Col span={6} className={styles.P6ContentRight}>
                      <div className={styles.P6ContentRightTitle}>
                        {intl.formatMessage({ id: 'pages.home.p6.3.title' })}
                      </div>
                      <div className={styles.P6ContentRightLine} />
                      <div className={styles.P6ContentRightDesc}>
                        {intl.formatMessage({ id: 'pages.home.p6.3.desc' })}
                      </div>
                    </Col>
                  </Row>
                </TweenOne>
              </Element>
              <Element prefixCls={styles.P6Content} key="4">
                <BgElement key="wg4" className={styles.P6ContentBg} />
                <TweenOne animation={{ y: 30, opacity: 0, type: 'from' }}>
                  <Row className={styles.P6ContentLayout} justify={'center'}>
                    <Col span={6} className={styles.P6ContentLeft}>
                      <img
                        alt={'homeImage67'}
                        src={homeImage67}
                        className={styles.P6ContentImage7}
                      />
                    </Col>
                    <Col span={6} className={styles.P6ContentRight}>
                      <div className={styles.P6ContentRightTitle}>
                        {intl.formatMessage({ id: 'pages.home.p6.4.title' })}
                      </div>
                      <div className={styles.P6ContentRightLine} />
                      <div className={styles.P6ContentRightDesc}>
                        {intl.formatMessage({ id: 'pages.home.p6.4.desc' })}
                      </div>
                    </Col>
                  </Row>
                </TweenOne>
              </Element>
              <Element prefixCls={styles.P6Content} key="5">
                <BgElement key="wg5" className={styles.P6ContentBg} />
                <TweenOne animation={{ y: 30, opacity: 0, type: 'from' }}>
                  <Row className={styles.P6ContentLayout} justify={'center'}>
                    <Col span={6} className={styles.P6ContentLeft}>
                      <img
                        alt={'homeImage68'}
                        src={homeImage68}
                        className={styles.P6ContentImage8}
                      />
                    </Col>
                    <Col span={6} className={styles.P6ContentRight}>
                      <div className={styles.P6ContentRightTitle}>
                        {intl.formatMessage({ id: 'pages.home.p6.5.title' })}
                      </div>
                      <div className={styles.P6ContentRightLine} />
                      <div className={styles.P6ContentRightDesc}>
                        {intl.formatMessage({ id: 'pages.home.p6.5.desc' })}
                      </div>
                    </Col>
                  </Row>
                </TweenOne>
              </Element>
            </BannerAnim>
          </div>
          <Row className={styles.P7} key="worksBannerButton" justify={'center'} gutter={8}>
            <Col>
              <div
                className={`${styles.P7Button} ${currentBanner === 0 && styles.P7ButtonHover}`}
                onClick={() => {
                  bannerRef?.slickGoTo(0);
                  setCurrentBanner(0);
                }}
              >
                <div>{intl.formatMessage({ id: 'pages.home.p7.0' })}</div>
              </div>
            </Col>
            <Col>
              <div
                className={`${styles.P7Button} ${currentBanner === 1 && styles.P7ButtonHover}`}
                onClick={() => {
                  bannerRef?.slickGoTo(1);
                  setCurrentBanner(1);
                }}
              >
                <div>{intl.formatMessage({ id: 'pages.home.p7.1' })}</div>
              </div>
            </Col>
            <Col>
              <div
                className={`${styles.P7Button} ${currentBanner === 2 && styles.P7ButtonHover}`}
                onClick={() => {
                  bannerRef?.slickGoTo(2);
                  setCurrentBanner(2);
                }}
              >
                <div>{intl.formatMessage({ id: 'pages.home.p7.2' })}</div>
              </div>
            </Col>
            <Col>
              <div
                className={`${styles.P7Button} ${currentBanner === 3 && styles.P7ButtonHover}`}
                onClick={() => {
                  bannerRef?.slickGoTo(3);
                  setCurrentBanner(3);
                }}
              >
                <div>{intl.formatMessage({ id: 'pages.home.p7.3' })}</div>
              </div>
            </Col>
            <Col>
              <div
                className={`${styles.P7Button} ${currentBanner === 4 && styles.P7ButtonHover}`}
                onClick={() => {
                  bannerRef?.slickGoTo(4);
                  setCurrentBanner(4);
                }}
              >
                <div>{intl.formatMessage({ id: 'pages.home.p7.4' })}</div>
              </div>
            </Col>
            <Col>
              <div
                className={`${styles.P7Button} ${currentBanner === 5 && styles.P7ButtonHover}`}
                onClick={() => {
                  bannerRef?.slickGoTo(5);
                  setCurrentBanner(5);
                }}
              >
                <div>{intl.formatMessage({ id: 'pages.home.p7.5' })}</div>
              </div>
            </Col>
          </Row>
        </QueueAnim>
      </ScrollAnim.OverPack>
    </div>
  );
};

export default Content2;
