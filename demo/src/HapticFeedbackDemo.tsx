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
    useState<Parameters<ImpactOccurredFunction>[0]>('heavy');
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
        <Form.Item>
          <div
              onClick={() => impactOccurred("soft")}
              className="transparent-button"
          >
            <img
                src={coinImage}
                alt="Coin"
            />
          </div>

        </Form.Item>
        <Form.Item label="type">
          <Select value={type} onChange={value => setType(value)}>
            <Select.Option value="error">error</Select.Option>
            <Select.Option value="success">success</Select.Option>
            <Select.Option value="warning">warning</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <div
            onClick={() => notificationOccurred(type)}
            className="transparent-button"

          >
            <img
                src={coinImage}
                alt="Coin"
            />
          </div>
        </Form.Item>
        <Form.Item>
          <div
              onClick={selectionChanged}
              className="transparent-button"
          >
            <img
                src={coinImage}
                alt="Coin"
            />
          </div>
        </Form.Item>
      </Form>
    </>
  );
};
export default HapticFeedbackDemo;
