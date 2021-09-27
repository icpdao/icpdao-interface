import React from 'react';
import { Button, Space } from 'antd';
import styles from '../index.less';
import { FormattedMessage } from '@@/plugin-locale/localeExports';
import { history } from '@@/core/history';
import AccessButton from '@/components/AccessButton';
import { AccessEnum } from '@/access';
import { getUserInfo } from '@/utils/utils';
import { useCallback } from 'react';
import Texty from 'rc-texty';
import { useIntl } from 'umi';

const Content0: React.FC = () => {
  const intl = useIntl();
  let defaultWarning = false;
  const { profile } = getUserInfo();
  if (profile && profile.icppership && !profile.icppership.mentor) {
    defaultWarning = true;
  }
  const handleMarkJob = useCallback(() => {
    history.push('/job');
  }, []);
  return (
    <div className={styles.ContentOne} key={'p1'}>
      <div className={styles.POne}>
        <Space direction="vertical">
          <div className={styles.p1Title}>
            <Texty
              type={'top'}
              mode={'sync'}
              split={(v) => {
                console.log(v);
                return v.split('');
              }}
            >
              {intl.formatMessage({ id: 'pages.home.p1' })}
            </Texty>
          </div>
          <div className={styles.p1Content}>
            <Texty delay={400} mode={'sync'}>
              {intl.formatMessage({ id: 'pages.home.p2.part1' })}
            </Texty>
            <Texty delay={420} mode={'sync'}>
              {intl.formatMessage({ id: 'pages.home.p2.part2' })}
            </Texty>
          </div>
          <div className={styles.p1Link}>
            {' '}
            <a href="https://icpdao-1.gitbook.io/icpdao/whitepaper" target={'_blank'}>
              whitepaper（En）
            </a>{' '}
            /{' '}
            <a href="https://icpdao.gitbook.io/icpdao/" target={'_blank'}>
              白皮书（中）
            </a>
            .
          </div>
        </Space>
        <Space style={{ marginTop: 85 }} size={30}>
          <Button
            key="exploreDao"
            style={{ width: 200 }}
            size={'large'}
            type="primary"
            onClick={() => history.push('/dao/explore')}
          >
            <FormattedMessage id={'pages.home.button1'} />
          </Button>
          <AccessButton
            key="markJob"
            style={{ width: 200 }}
            allow={AccessEnum.PREICPPER}
            defaultWarningModal={defaultWarning}
            delayWarningModal={1000}
            size={'large'}
            type="primary"
            onClick={handleMarkJob}
          >
            <FormattedMessage id={'pages.home.button2'} />
          </AccessButton>
        </Space>
      </div>
    </div>
  );
};

export default Content0;
