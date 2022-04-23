import { Alert, Button, Col, Row, Typography } from 'antd';
import React, { useContext, useEffect, useState } from 'react';
import Link from 'next/link';

import Discord from '../../components/config/notification/discord';
import Browser from '../../components/config/notification/browser';
import Twitter from '../../components/config/notification/twitter';
import Federation from '../../components/config/notification/federation';
import TextFieldWithSubmit, {
  TEXTFIELD_TYPE_URL,
} from '../../components/config/form-textfield-with-submit';
import { TEXTFIELD_PROPS_FEDERATION_INSTANCE_URL } from '../../utils/config-constants';
import { ServerStatusContext } from '../../utils/server-status-context';
import { UpdateArgs } from '../../types/config-section';

const { Title } = Typography;

export default function ConfigNotify() {
  const [formDataValues, setFormDataValues] = useState(null);
  const serverStatusData = useContext(ServerStatusContext);
  const { serverConfig } = serverStatusData || {};
  const { yp } = serverConfig;
  const { instanceUrl } = yp;

  useEffect(() => {
    setFormDataValues({
      instanceUrl,
    });
  }, [yp]);

  const handleSubmitInstanceUrl = () => {
    setFormDataValues({
      ...formDataValues,
      enabled: false,
    });
  };

  const handleFieldChange = ({ fieldName, value }: UpdateArgs) => {
    setFormDataValues({
      ...formDataValues,
      [fieldName]: value,
    });
  };

  const enabled = instanceUrl !== '';
  console.log(enabled);
  const configurationWarning = !enabled && (
    <>
      <Alert
        message="You must set your server URL before you can enable this feature."
        type="warning"
        showIcon
      />
      <br />
      <TextFieldWithSubmit
        fieldName="instanceUrl"
        {...TEXTFIELD_PROPS_FEDERATION_INSTANCE_URL}
        value={formDataValues?.instanceUrl || ''}
        initialValue={yp.instanceUrl}
        type={TEXTFIELD_TYPE_URL}
        onChange={handleFieldChange}
        onSubmit={handleSubmitInstanceUrl}
        required
      />
    </>
  );

  return (
    <>
      <Title>Notifications</Title>
      <p className="description">
        Let your viewers know when you go live by supporting any of the below notification channels.{' '}
        <a
          href="https://owncast.online/docs/notifications/?source=admin"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn more about live notifications.
        </a>
      </p>

      {configurationWarning}

      <Row>
        <Col
          span={10}
          className={`form-module ${enabled ? '' : 'disabled'}`}
          style={{ margin: '5px', display: 'flex', flexDirection: 'column' }}
        >
          <Browser />
        </Col>
        <Col
          span={10}
          className={`form-module ${enabled ? '' : 'disabled'}`}
          style={{ margin: '5px', display: 'flex', flexDirection: 'column' }}
        >
          <Twitter />
        </Col>

        <Col
          span={10}
          className={`form-module ${enabled ? '' : 'disabled'}`}
          style={{ margin: '5px', display: 'flex', flexDirection: 'column' }}
        >
          <Discord />
        </Col>

        <Col
          span={10}
          className={`form-module ${enabled ? '' : 'disabled'}`}
          style={{ margin: '5px', display: 'flex', flexDirection: 'column' }}
        >
          <Federation />
        </Col>

        <Col
          span={10}
          className={`form-module ${enabled ? '' : 'disabled'}`}
          style={{ margin: '5px', display: 'flex', flexDirection: 'column' }}
        >
          <Title>Custom</Title>
          <p className="description">Build your own notifications by using custom webhooks.</p>

          <Link passHref href="/webhooks">
            <Button
              type="primary"
              style={{
                position: 'relative',
                marginLeft: 'auto',
                right: '0',
                marginTop: '20px',
              }}
            >
              Create
            </Button>
          </Link>
        </Col>
      </Row>
    </>
  );
}
