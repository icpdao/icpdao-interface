import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Checkbox, Modal, Popover, Typography } from 'antd';
import styles from './index.less';
import { history } from 'umi';
import { getGithubOAuthUrl } from './AvatarDropdown';
import { AccessEnum } from '@/access';
import AccessButton from '@/components/AccessButton';
import { ReadOutlined } from '@ant-design/icons';
import { useModel } from '@@/plugin-model/useModel';

const { Paragraph, Link } = Typography;

const Guide: React.FC<{ isLogin: boolean }> = ({ isLogin }) => {
  const [guideModalVisible, setGuideModalVisible] = useState(false);
  const [guideModalNoLongerShow, setGuideModalNoLongerShow] = useState(true);
  const [guideModalNoLongerRemind, setGuideModalNoLongerRemind] = useState(false);
  const { openGuideEvent, closeGuideEvent } = useModel('useGuideModel');

  useEffect(() => {
    const noLongerRemind = localStorage.getItem('no_longer_remind') || '0';
    if (noLongerRemind === '1') setGuideModalNoLongerRemind(true);
    else setGuideModalNoLongerRemind(false);
  }, []);

  const githubPopover = useMemo(() => {
    return (
      <Popover
        content={
          <div className={styles.GuidePopoverContent}>
            <div>
              GitHub is the world's largest code access repository and open source community; it is
              used to publicly store the contributions of ICPDAO citizens, such as code, text,
              links, pictures, etc.
            </div>
            {!isLogin && (
              <div style={{ marginTop: '1rem' }}>
                <Button href={getGithubOAuthUrl()} size={'small'} type={'primary'}>
                  LOG IN
                </Button>
              </div>
            )}
          </div>
        }
        overlayInnerStyle={{ maxWidth: '21.875rem' }}
        placement={'bottomLeft'}
        arrowPointAtCenter
      >
        <Link strong>GitHub</Link>
      </Popover>
    );
  }, [isLogin]);
  const markJobPopover = useMemo(() => {
    return (
      <Popover
        content={
          <div className={styles.GuidePopoverContent}>
            <div>
              In ICPDAO, every citizen has the right to participate in the contribution activities
              of any organization, and the quotation is set by oneself. Even if you just modify a
              typo, you can also mark it down and request a reward.
            </div>
            <div style={{ marginTop: '1rem' }}>
              <AccessButton
                allow={AccessEnum.NOMARL}
                size={'small'}
                type="primary"
                onClick={() => {
                  history.push('/job');
                }}
              >
                MARK JOB
              </AccessButton>
            </div>
          </div>
        }
        overlayInnerStyle={{ maxWidth: '21.875rem' }}
        placement={'bottomLeft'}
        arrowPointAtCenter
      >
        <Link strong>mark your job and offers on any slab under your feet</Link>
      </Popover>
    );
  }, []);
  const exploreDAOPopover = useMemo(() => {
    return (
      <Popover
        content={
          <div className={styles.GuidePopoverContent}>
            <div>
              Stone slabs in the square record every citizen's contribution and quotation in detail,
              anyone can check .
            </div>
            <div style={{ marginTop: '1rem' }}>
              <Button size={'small'} type={'primary'} onClick={() => history.push('/dao/explore')}>
                EXPLORE DAO
              </Button>
            </div>
          </div>
        }
        overlayInnerStyle={{ maxWidth: '21.875rem' }}
        placement={'bottomLeft'}
        arrowPointAtCenter
      >
        <Link strong>browse each stone slab</Link>
      </Popover>
    );
  }, []);
  const eiPopover = useMemo(() => {
    return (
      <Popover
        content={
          <div className={styles.GuidePopoverContent}>
            <p>When EI=1, the community thinks your efficiency is appropriate;</p>
            <p>
              When EI&gt;1, the community thinks that your efficiency is too high, and it is
              recommended to report a higher size next time;
            </p>
            <p>
              When EI&lt;0.8, the community thinks that your efficiency is low, and it is
              recommended to report a lower size next time; if it is lower than 0.8 twice in a row,
              the total size of the current month will be halved;
            </p>
            <p>
              When EI&lt;0.4, the community thinks that your efficiency is too low, and it is
              recommended to report a lower size next time; if it is lower than 0.4 twice in a row,
              the total size of the current month will be halved, and the reviewer's size will be
              deducted at the same time. The number is the merged one this time The total size of
              the Icpper is half, but not more than the reviewer's contribution this time.
            </p>
          </div>
        }
        overlayInnerStyle={{ maxWidth: '31.25rem' }}
        placement={'bottomLeft'}
        arrowPointAtCenter
      >
        <Link strong>a set of mysterious core rules</Link>
      </Popover>
    );
  }, []);
  const findMentorPopover = useMemo(() => {
    return (
      <Popover
        content={
          <div className={styles.GuidePopoverContent}>
            <p>In ICPDAO, every citizen will have a mentor to guide.</p>
            <p>
              We believe everyone has the ability to contribute, it just needs to be the right
              project and the right way, even finding a bug can be rewarded.
            </p>
            <p>
              Everything is hard at first, and Mentor's core mission at ICPDAO is to help you find
              the right project, leverage your talents, and work with you whenever you need it.
            </p>
            <p>The only thing you need to do is to find the right Mentor in ICPDAO.</p>
            <div style={{ marginTop: '1rem' }}>
              <Button
                size={'small'}
                type={'primary'}
                href={'https://discord.gg/ACxJEUh68d'}
                target={'_blank'}
              >
                FIND A MENTOR
              </Button>
            </div>
          </div>
        }
        overlayInnerStyle={{ maxWidth: '31.25rem' }}
        placement={'bottomLeft'}
        arrowPointAtCenter
      >
        <Link strong>and one had to be led by a mentor</Link>
      </Popover>
    );
  }, []);

  const handlerGoSee = useCallback(() => {
    if (isLogin) history.push('/job/cycle');
    else window.location.href = getGithubOAuthUrl();
  }, [isLogin]);

  const goSeePopover = useMemo(() => {
    return (
      <Popover
        content={
          <div className={styles.GuidePopoverContent}>
            <div>When the sun shines, your EI value will appear.</div>
            <div style={{ marginTop: '1rem' }}>
              <Button size={'small'} type={'primary'} onClick={handlerGoSee}>
                GO SEE
              </Button>
            </div>
          </div>
        }
        overlayInnerStyle={{ maxWidth: '21.875rem' }}
        placement={'bottomLeft'}
        arrowPointAtCenter
      >
        <Link strong>everyone's EI will appear in the sky</Link>
      </Popover>
    );
  }, [handlerGoSee]);

  openGuideEvent.useSubscription(() => {
    setGuideModalVisible(true);
  });

  return (
    <>
      <Modal
        visible={guideModalVisible}
        maskClosable={true}
        destroyOnClose={true}
        bodyStyle={{
          paddingTop: 62,
          textAlign: 'left',
          fontWeight: 400,
          overflowY: 'auto',
          padding: '26px 39px',
        }}
        title={
          <div className={styles.GuideTitle}>
            Welcome to ICPDAO, <br />a kingdom where every effort is rewarded！
          </div>
        }
        footer={
          guideModalNoLongerShow ? (
            <div className={styles.GuideFooter}>
              <Checkbox
                checked={guideModalNoLongerRemind}
                onChange={(e) => {
                  localStorage.setItem('no_longer_remind', e.target.checked ? '1' : '0');
                  setGuideModalNoLongerRemind(e.target.checked);
                }}
              >
                No longer remind
              </Checkbox>
            </div>
          ) : null
        }
        className={styles.GuideModal}
        centered
        onCancel={() => {
          setGuideModalVisible(false);
          setGuideModalNoLongerShow(true);
          closeGuideEvent.emit();
        }}
      >
        <Typography className={styles.GuideContent}>
          <Paragraph>Anyone from {githubPopover} can become a citizen.</Paragraph>
          <Paragraph>
            Here, every citizen has the power of independence, and you can {markJobPopover}, as you
            see fit. You can stroll around the square and {exploreDAOPopover}. A large monument is
            erected in the center of the square. Two characters are engraved on the front of the
            monument: EI, the legend is a magic index that has been implemented for thousands of
            years; the back of the monument is engraved with {eiPopover}, which are automatically
            executed on the square, No one can challenge. when Night Falls and the Moon is full,
            huge monuments begin to rotate, matching the engraved slabs from the same community in
            the square one after another; in the dark, the contributors to the community cast their
            sacred vote in favor of the more efficient slab, who could see nothing; In the polis,
            voting is a sacred affair, {findMentorPopover}; When the sun rises and fills the square,{' '}
            {goSeePopover}, some happy and some sad, all due to a mysterious number: 0.8; Here,
            those whose EI is closest, ≥0.8, will be the "savviest", while those whose EI&lt;0.8 are
            said to face losses and doubts... <br />
          </Paragraph>
          <Paragraph>&nbsp;</Paragraph>
        </Typography>
      </Modal>
      <ReadOutlined
        onClick={() => {
          setGuideModalNoLongerShow(false);
          setGuideModalVisible(true);
        }}
        className={styles.GuideIcon}
      />
    </>
  );
};

export default Guide;
