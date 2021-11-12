import { ReactNode } from 'react';
import { Button, Col, message, Row } from 'antd';
import discordLOGO from '@/assets/image/discord-logo.png';
import logoLong from '@/assets/image/icpdao-logo.png';
import styles from './index.less';
import { useAccess } from '@@/plugin-access/access';
import { LoginButton } from '@/components/RightHeader/AvatarDropdown';
import { useRequest } from 'ahooks';
import { bindDiscord } from '@/services/icpdao-interface/discord';
import { history } from 'umi';

export default (props: { match: { params: { tmpId: string } } }): ReactNode => {
  const tmpId = props.match.params.tmpId;
  const access = useAccess();

  const { loading, run: handlerConnect } = useRequest(
    async () => {
      await bindDiscord({ bindId: tmpId });
    },
    {
      manual: true,
      onSuccess: () => {
        message.success(
          `Bind successfully! You can close the current page, or jump back to the home page after 5 seconds ...`,
          4,
        );
        setTimeout(() => {
          history.push('/home');
        }, 4500);
      },
      onError: () => {
        message.error(
          'Binding failed, please return to retry! You can close the current page, or jump back to the home page after 5 seconds ...',
          4,
        );
        setTimeout(() => {
          history.push('/home');
        }, 4500);
      },
    },
  );

  if (access.noLogin()) {
    return (
      <div>
        <Row justify={'center'} style={{ marginTop: '350px' }}>
          <Col span={6}>
            <LoginButton size={'large'} />
          </Col>
        </Row>
      </div>
    );
  }

  return (
    <div>
      <Row justify={'center'} style={{ marginTop: '196px' }}>
        <Col>
          <div className={styles.DiscordConnectText}>
            Are you sure to connect Discord to ICPDAO?
          </div>
        </Col>
      </Row>
      <Row justify={'center'} gutter={120} style={{ marginTop: '110px' }}>
        <Col span={'126px'}>
          <img src={discordLOGO} width={'126px'} alt="discord" />
        </Col>
        <Col span={'200px'} className={styles.Spinner}>
          <div className={styles.Bounce1} />
          <div className={styles.Bounce2} />
          <div className={styles.Bounce3} />
        </Col>
        <Col span={'126px'}>
          <img src={logoLong} width={'126px'} alt="icpdao" />
        </Col>
      </Row>
      <Row justify={'center'} style={{ marginTop: '104px' }}>
        <Col span={6}>
          <Button type={'primary'} size={'large'} loading={loading} block onClick={handlerConnect}>
            Connect
          </Button>
        </Col>
      </Row>
    </div>
  );
};
