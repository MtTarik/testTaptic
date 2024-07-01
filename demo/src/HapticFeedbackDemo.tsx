import React, { FC, useEffect, useState, useRef } from 'react';
import { useHapticFeedback } from '@vkruglikov/react-telegram-web-app';
import coinImage from './assets/image/coin.png';
import styles from './assets/MultiTouchClickerGame.module.css';

interface TouchPoint {
  id: number;
  x: number;
  y: number;
}

const MAX_TAPS = 2000;
const RECOVERY_INTERVAL = 3000; // 3 seconds
const RECOVERY_AMOUNT = 1; // Amount of taps to recover every interval
const VIBRATION_DURATION = 100; // Vibration duration in milliseconds

const HapticFeedbackDemo: FC = () => {
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [touchPoints, setTouchPoints] = useState<TouchPoint[]>([]);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [availableTaps, setAvailableTaps] = useState<number>(MAX_TAPS);
  const [impactOccurred] = useHapticFeedback();
  const touchIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const vibrationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const recoveryInterval = setInterval(() => {
      setAvailableTaps((prevTaps) => Math.min(prevTaps + RECOVERY_AMOUNT, MAX_TAPS));
    }, RECOVERY_INTERVAL);
    return () => clearInterval(recoveryInterval);
  }, []);

  const startVibration = () => {
    vibrationIntervalRef.current = setInterval(() => {
      impactOccurred("medium");
    }, VIBRATION_DURATION);
  };

  const stopVibration = () => {
    if (vibrationIntervalRef.current) {
      clearInterval(vibrationIntervalRef.current);
      vibrationIntervalRef.current = null;
    }
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (availableTaps <= 0) return;

    event.preventDefault();
    const touches = event.touches;
    const coinRect = event.currentTarget.getBoundingClientRect();

    const addTouchPoints = () => {
      const newTouchPoints: TouchPoint[] = Array.from(touches).map((touch, index) => ({
        id: Date.now() + index,
        x: touch.clientX - coinRect.left,
        y: touch.clientY - coinRect.top,
      }));

      setTouchPoints((prevTouchPoints) => [...prevTouchPoints, ...newTouchPoints]);
      setCurrentScore((prevScore) => prevScore + touches.length);
      setTotalScore((prevTotalScore) => prevTotalScore + touches.length);
      setAvailableTaps((prevTaps) => Math.max(prevTaps - touches.length, 0));

      startVibration();

      const coin = document.querySelector(`.${styles.coin}`) as HTMLElement;
      if (coin) {
        const coinRect = coin.getBoundingClientRect();
        const centerX = coinRect.left + coin.offsetWidth / 2;
        const centerY = coinRect.top + coin.offsetHeight / 2;
        const touchesArray = Array.from(touches);

        touchesArray.forEach((touch) => {
          let tiltAngleX = 0;
          let tiltAngleY = 0;

          if (touch.clientY < centerY) {
            tiltAngleX = -(centerY - touch.clientY) / 10;
          } else if (touch.clientY > centerY) {
            tiltAngleX = (touch.clientY - centerY) / 10;
          }

          if (touch.clientX < centerX) {
            tiltAngleY = -(centerX - touch.clientX) / 10;
          } else if (touch.clientX > centerX) {
            tiltAngleY = (centerX - touch.clientX) / 10;
          }

          coin.style.transition = 'none';
          coin.style.transform = `scale(0.9) rotateX(${tiltAngleX}deg) rotateY(${tiltAngleY}deg)`;
        });

        coin.classList.add(styles.active);
      }
    };

    addTouchPoints();
    touchIntervalRef.current = setInterval(addTouchPoints, 100);
  };

  const handleTouchEnd = () => {
    const coin = document.querySelector(`.${styles.coin}`) as HTMLElement;
    if (coin) {
      coin.classList.remove(styles.active);
      coin.style.transition = '';
      coin.style.transform = `scale(0.9) rotateX(0deg) rotateY(0deg)`;
    }

    stopVibration();

    if (touchIntervalRef.current) {
      clearInterval(touchIntervalRef.current);
      touchIntervalRef.current = null;
    }

    setTouchPoints([]);
  };

  const progressBarWidth = `${(availableTaps / MAX_TAPS) * 100}%`;

  return (
      <div className={styles.gameContainer}>
        <div className={styles.scoreContainer}>
          <span>{availableTaps}/{MAX_TAPS}</span>
        </div>
        <div className={styles.progressBarContainer}>
          <div className={styles.progressBar} style={{ width: progressBarWidth }} />
        </div>
        <div className={styles.buttonContainer}>
          <div className={styles.coinButton}>
            <div className={styles.coinContainer}>
              <img
                  onClick={() => impactOccurred("medium")}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  src={coinImage}
                  className={styles.coin}
                  alt="Coin"
              />
              {touchPoints.map((point) => (
                  <div
                      key={point.id}
                      className={`${styles.touchPoint} ${styles.touchPointAnimated}`}
                      style={{ left: point.x - 50, top: point.y - 50 }}
                  >
                    +1
                  </div>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.totalScore}>
          Total Score: {totalScore}
        </div>
      </div>
  );
};

export default HapticFeedbackDemo;
