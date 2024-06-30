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
          <div className={'gameContainer'}>
            <div className={'buttonContainer'}>


              <div

                  onClick={() => impactOccurred("medium")}
                  className="coinContainer"
              >
                <img
                    src={coinImage}
                    className={"coin"}
                    alt="Coin"
                />
              </div>
            </div>
          </div>


        </Form.Item>
      </Form>
    </>
  );
};
export default HapticFeedbackDemo;
