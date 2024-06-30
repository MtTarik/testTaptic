import { Button, Form, Typography, Select } from 'antd';
import { FC, useState } from 'react';
import {
  ImpactOccurredFunction,
  NotificationOccurredFunction,
  useHapticFeedback,
} from '@vkruglikov/react-telegram-web-app';
import coinImage from './assets/image/coin.png';

const HapticFeedbackDemo: FC = () => {
  const [impactOccurred, notificationOccurred, selectionChanged] =
    useHapticFeedback();
  const [style, setStyle] =
    useState<Parameters<ImpactOccurredFunction>[0]>('light');
  const [type, setType] =
    useState<Parameters<NotificationOccurredFunction>[0]>('error');

  return (
    <>
      <Form
        labelCol={{ span: 6 }}
        name="HapticFeedbackDemo"
        layout="horizontal"
        autoComplete="off"
      >
        <Form.Item label="style">
          <Select value={style} onChange={value => setStyle(value)}>
            <Select.Option value="light">light</Select.Option>
            <Select.Option value="medium">medium</Select.Option>
            <Select.Option value="heavy">heavy</Select.Option>
            <Select.Option value="rigid">rigid</Select.Option>
            <Select.Option value="soft">soft</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button
              block
              onClick={selectionChanged}
              className="transparent-button"
          >
            <img
                src={coinImage}
                alt="Coin"
            />
          </Button>

        </Form.Item>
        <Form.Item label="type">
          <Select value={type} onChange={value => setType(value)}>
            <Select.Option value="error">error</Select.Option>
            <Select.Option value="success">success</Select.Option>
            <Select.Option value="warning">warning</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button
            block
            onClick={() => notificationOccurred(type)}
            className="transparent-button"

          >
            <img
                src={coinImage}
                alt="Coin"
            />
          </Button>
        </Form.Item>
        <Form.Item>
          <Button
              block
              onClick={selectionChanged}
              className="transparent-button"
          >
            <img
                src={coinImage}
                alt="Coin"
            />
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};
export default HapticFeedbackDemo;
