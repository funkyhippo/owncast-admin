import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import Head from 'next/head';
import { differenceInSeconds } from 'date-fns';
import { useRouter } from 'next/router';
import { Layout, Menu, Popover, Alert, Typography, Button, Space, Tooltip } from 'antd';
import {
  SettingOutlined,
  HomeOutlined,
  LineChartOutlined,
  ToolOutlined,
  PlayCircleFilled,
  MinusSquareFilled,
  QuestionCircleOutlined,
  MessageOutlined,
  ExperimentOutlined,
  EditOutlined,
} from '@ant-design/icons';
import classNames from 'classnames';
import { upgradeVersionAvailable } from '../utils/apis';
import { parseSecondsToDurationString } from '../utils/format';

import OwncastLogo from './logo';
import { ServerStatusContext } from '../utils/server-status-context';
import { AlertMessageContext } from '../utils/alert-message-context';

import TextFieldWithSubmit from './config/form-textfield-with-submit';
import { TEXTFIELD_PROPS_STREAM_TITLE } from '../utils/config-constants';
import ComposeFederatedPost from './compose-federated-post';
import { UpdateArgs } from '../types/config-section';

// eslint-disable-next-line react/function-component-definition
export default function MainLayout(props) {
  const { children } = props;

  const context = useContext(ServerStatusContext);
  const { serverConfig, online, broadcaster, versionNumber } = context || {};
  const { instanceDetails, chatDisabled, federation } = serverConfig;
  const { enabled: federationEnabled } = federation;

  const [currentStreamTitle, setCurrentStreamTitle] = useState('');
  const [postModalDisplayed, setPostModalDisplayed] = useState(false);

  const alertMessage = useContext(AlertMessageContext);

  const router = useRouter();
  const { route } = router || {};

  const { Header, Footer, Content, Sider } = Layout;
  const { SubMenu } = Menu;

  const [upgradeVersion, setUpgradeVersion] = useState('');
  const checkForUpgrade = async () => {
    try {
      const result = await upgradeVersionAvailable(versionNumber);
      setUpgradeVersion(result);
    } catch (error) {
      console.log('==== error', error);
    }
  };

  useEffect(() => {
    checkForUpgrade();
  }, [versionNumber]);

  useEffect(() => {
    setCurrentStreamTitle(instanceDetails.streamTitle);
  }, [instanceDetails]);

  const handleStreamTitleChanged = ({ value }: UpdateArgs) => {
    setCurrentStreamTitle(value);
  };

  const handleCreatePostButtonPressed = () => {
    setPostModalDisplayed(true);
  };

  const appClass = classNames({
    'app-container': true,
    online,
  });

  const upgradeMenuItemStyle = upgradeVersion ? 'block' : 'none';
  const upgradeVersionString = `${upgradeVersion}` || '';
  const upgradeMessage = `Upgrade to v${upgradeVersionString}`;
  const chatMenuItemStyle = chatDisabled ? 'none' : 'block';
  const openMenuItems = upgradeVersion ? ['utilities-menu'] : [];

  const clearAlertMessage = () => {
    alertMessage.setMessage(null);
  };

  const headerAlertMessage = alertMessage.message ? (
    <Alert message={alertMessage.message} afterClose={clearAlertMessage} banner closable />
  ) : null;

  // status indicator items
  const streamDurationString = broadcaster
    ? parseSecondsToDurationString(differenceInSeconds(new Date(), new Date(broadcaster.time)))
    : '';
  const currentThumbnail = online ? (
    <img src="/thumbnail.jpg" className="online-thumbnail" alt="current thumbnail" width="1rem" />
  ) : null;
  const statusIcon = online ? <PlayCircleFilled /> : <MinusSquareFilled />;
  const statusMessage = online ? `Online ${streamDurationString}` : 'Offline';
  const popoverTitle = <Typography.Text>Thumbnail</Typography.Text>;

  const statusIndicator = (
    <div className="online-status-indicator">
      <span className="status-label">{statusMessage}</span>
      <span className="status-icon">{statusIcon}</span>
    </div>
  );
  const statusIndicatorWithThumb = online ? (
    <Popover content={currentThumbnail} title={popoverTitle} trigger="hover">
      {statusIndicator}
    </Popover>
  ) : (
    statusIndicator
  );

  return (
    <Layout className={appClass}>
      <Head>
        <title>Owncast Admin</title>
        <link rel="icon" type="image/png" sizes="32x32" href="/img/favicon/favicon-32x32.png" />
      </Head>

      <Sider width={240} className="side-nav">
        <h1 className="owncast-title">
          <span className="logo-container">
            <OwncastLogo />
          </span>
          <span className="title-label">Owncast Admin</span>
        </h1>
        <Menu
          defaultSelectedKeys={[route.substring(1) || 'home']}
          defaultOpenKeys={openMenuItems}
          mode="inline"
          className="menu-container"
        >
          <Menu.Item key="home" icon={<HomeOutlined />}>
            <Link href="/admin">Home</Link>
          </Menu.Item>

          <Menu.Item key="viewer-info" icon={<LineChartOutlined />} title="Current stream">
            <Link href="/admin/viewer-info">Viewers</Link>
          </Menu.Item>

          <SubMenu
            key="chat-config"
            title="Chat &amp; Users"
            icon={<MessageOutlined />}
            style={{ display: chatMenuItemStyle }}
          >
            <Menu.Item key="messages" title="Chat utilities">
              <Link href="/admin/chat/messages">Messages</Link>
            </Menu.Item>

            <Menu.Item key="chat-users" title="Chat utilities">
              <Link href="/admin/chat/users">Users</Link>
            </Menu.Item>
          </SubMenu>

          <Menu.Item
            style={{ display: federationEnabled ? 'block' : 'none' }}
            key="federation-followers"
            title="Fediverse followers"
            icon={
              <img
                alt="fediverse icon"
                src="/admin/fediverse-white.png"
                width="15rem"
                style={{ opacity: 0.6, position: 'relative', top: '-1px' }}
              />
            }
          >
            <Link href="/admin/federation/followers">Followers</Link>
          </Menu.Item>

          <SubMenu key="configuration" title="Configuration" icon={<SettingOutlined />}>
            <Menu.Item key="config-public-details">
              <Link href="/admin/config-public-details">General</Link>
            </Menu.Item>

            <Menu.Item key="config-server-details">
              <Link href="/admin/config-server-details">Server Setup</Link>
            </Menu.Item>
            <Menu.Item key="config-video">
              <Link href="/admin/config-video">Video</Link>
            </Menu.Item>
            <Menu.Item key="config-chat">
              <Link href="/admin/config-chat">Chat</Link>
            </Menu.Item>
            <Menu.Item key="config-federation">
              <Link href="/admin/config-federation">Social</Link>
            </Menu.Item>
            <Menu.Item key="config-notify">
              <Link href="/admin/config-notify">Notifications</Link>
            </Menu.Item>

            <Menu.Item key="config-storage">
              <Link href="/admin/config-storage">S3 Storage</Link>
            </Menu.Item>
          </SubMenu>

          <SubMenu key="utilities-menu" icon={<ToolOutlined />} title="Utilities">
            <Menu.Item key="hardware-info">
              <Link href="/admin/hardware-info">Hardware</Link>
            </Menu.Item>
            <Menu.Item key="stream-health">
              <Link href="/admin/stream-health">Stream Health</Link>
            </Menu.Item>
            <Menu.Item key="logs">
              <Link href="/admin/logs">Logs</Link>
            </Menu.Item>
            <Menu.Item
              key="federation-activities"
              title="Social Actions"
              style={{ display: federationEnabled ? 'block' : 'none' }}
            >
              <Link href="/admin/federation/actions">Social Actions</Link>
            </Menu.Item>
            <Menu.Item key="upgrade" style={{ display: upgradeMenuItemStyle }}>
              <Link href="/upgrade">{upgradeMessage}</Link>
            </Menu.Item>
          </SubMenu>
          <SubMenu key="integrations-menu" icon={<ExperimentOutlined />} title="Integrations">
            <Menu.Item key="webhooks">
              <Link href="/admin/webhooks">Webhooks</Link>
            </Menu.Item>
            <Menu.Item key="access-tokens">
              <Link href="/admin/access-tokens">Access Tokens</Link>
            </Menu.Item>
            <Menu.Item key="actions">
              <Link href="/admin/actions">External Actions</Link>
            </Menu.Item>
          </SubMenu>
          <Menu.Item key="help" icon={<QuestionCircleOutlined />} title="Help">
            <Link href="/admin/help">Help</Link>
          </Menu.Item>
        </Menu>
      </Sider>

      <Layout className="layout-main">
        <Header className="layout-header">
          <Space direction="horizontal">
            <Tooltip title="Compose post to your followers">
              <Button
                type="primary"
                shape="circle"
                icon={<EditOutlined />}
                size="large"
                onClick={handleCreatePostButtonPressed}
                style={{ display: federationEnabled ? 'block' : 'none' }}
              />
            </Tooltip>
          </Space>
          <div className="global-stream-title-container">
            <TextFieldWithSubmit
              fieldName="streamTitle"
              {...TEXTFIELD_PROPS_STREAM_TITLE}
              placeholder="What are you streaming now"
              value={currentStreamTitle}
              initialValue={instanceDetails.streamTitle}
              onChange={handleStreamTitleChanged}
            />
          </div>
          <Space direction="horizontal">{statusIndicatorWithThumb}</Space>
        </Header>

        {headerAlertMessage}

        <Content className="main-content-container">{children}</Content>

        <Footer className="footer-container">
          <a href="https://owncast.online/?source=admin" target="_blank" rel="noopener noreferrer">
            About Owncast v{versionNumber}
          </a>
        </Footer>
      </Layout>

      <ComposeFederatedPost
        visible={postModalDisplayed}
        handleClose={() => setPostModalDisplayed(false)}
      />
    </Layout>
  );
}

MainLayout.propTypes = {
  children: PropTypes.element.isRequired,
};
