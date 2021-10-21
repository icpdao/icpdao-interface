import React, { useMemo } from 'react';
import { Col, Dropdown, Menu, Row } from 'antd';
import { useIntl } from 'umi';
import { DownOutlined } from '@ant-design/icons';
import styles from './index.less';

const GlobalHeaderContent: React.FC = () => {
  const intl = useIntl();
  const communityMenu = useMemo(() => {
    return (
      <Menu>
        <Menu.Item key={0}>
          <a target="_blank" rel="noopener noreferrer" href="https://twitter.com/icpdao">
            {intl.formatMessage({
              id: 'component.globalHeader.content.dropdown.community.twitter',
            })}
          </a>
        </Menu.Item>
        <Menu.Item key={0}>
          <a target="_blank" rel="noopener noreferrer" href="https://discord.gg/QEaYUqkzSa">
            {intl.formatMessage({
              id: 'component.globalHeader.content.dropdown.community.discord',
            })}
          </a>
        </Menu.Item>
        <Menu.Item key={0}>
          <a target="_blank" rel="noopener noreferrer" href="mailto:icpdao06@gmail.com">
            {intl.formatMessage({ id: 'component.globalHeader.content.dropdown.community.gmail' })}
          </a>
        </Menu.Item>
        <Menu.Item key={0}>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.youtube.com/channel/UC9vo3RcUbA6V4V6ouYR8nqg"
          >
            {intl.formatMessage({
              id: 'component.globalHeader.content.dropdown.community.youtube',
            })}
          </a>
        </Menu.Item>
      </Menu>
    );
  }, [intl]);
  const aboutMenu = useMemo(() => {
    return (
      <Menu>
        <Menu.Item key={0}>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://icpdao-1.gitbook.io/icpdao/whitepaper"
          >
            {intl.formatMessage({
              id: 'component.globalHeader.content.dropdown.about.white_paper',
            })}
          </a>
        </Menu.Item>
        <Menu.Item key={0}>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://icpdao.gitbook.io/icpdao/bai-pi-shu-1"
          >
            {intl.formatMessage({
              id: 'component.globalHeader.content.dropdown.about.white_paper_zh',
            })}
          </a>
        </Menu.Item>
        <Menu.Item key={0}>
          <a target="_blank" rel="noopener noreferrer" href="https://github.com/icpdao">
            {intl.formatMessage({ id: 'component.globalHeader.content.dropdown.about.github' })}
          </a>
        </Menu.Item>
        <Menu.Item key={0}>
          <a target="_blank" rel="noopener noreferrer" href="https://icpdao.gitbook.io/icpdao/">
            {intl.formatMessage({ id: 'component.globalHeader.content.dropdown.about.docs' })}
          </a>
        </Menu.Item>
      </Menu>
    );
  }, [intl]);
  return (
    <Row justify={'center'} className={styles.HeaderDropdown}>
      <Col style={{ marginRight: '60px' }}>
        <Dropdown overlay={communityMenu}>
          <a className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
            {intl.formatMessage({ id: 'component.globalHeader.content.dropdown.community' })}
            <DownOutlined style={{ marginLeft: '4px' }} />
          </a>
        </Dropdown>
      </Col>
      <Col>
        <Dropdown overlay={aboutMenu}>
          <a className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
            {intl.formatMessage({ id: 'component.globalHeader.content.dropdown.about' })}
            <DownOutlined style={{ marginLeft: '4px' }} />
          </a>
        </Dropdown>
      </Col>
    </Row>
  );
};

export default GlobalHeaderContent;
