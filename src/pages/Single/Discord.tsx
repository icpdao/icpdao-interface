import { ReactNode } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Button, Col, message, Row } from 'antd';
import discordLOGO from '@/assets/image/discord-logo.png';
import logoLong from '../../../public/logo_long.png';
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
      <PageContainer ghost header={undefined}>
        <Row justify={'center'} style={{ marginTop: '200px' }}>
          <Col span={6}>
            <LoginButton size={'large'} />
          </Col>
        </Row>
      </PageContainer>
    );
  }

  return (
    <PageContainer ghost header={undefined}>
      <Row justify={'center'} style={{ marginTop: '150px' }}>
        <Col>
          <div className={styles.DiscordConnectText}>
            Are you sure you want to link the discord account to your ICPDAO account?
          </div>
        </Col>
      </Row>
      <Row justify={'center'} gutter={120} style={{ marginTop: '70px' }}>
        <Col>
          <img src={discordLOGO} width={'200px'} alt="discord" />
        </Col>
        <Col>
          <img src={logoLong} width={'200px'} height={'80px'} alt="icpdao" />
        </Col>
      </Row>
      <Row justify={'center'} style={{ marginTop: '100px' }}>
        <Col span={6}>
          <Button type={'primary'} size={'large'} loading={loading} block onClick={handlerConnect}>
            Connect
          </Button>
        </Col>
      </Row>
    </PageContainer>
  );
};
