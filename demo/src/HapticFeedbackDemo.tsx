import React, { FC, useEffect, useState } from 'react';
import { useHapticFeedback } from '@vkruglikov/react-telegram-web-app';
import coinImage from './assets/image/coin.png';
import styles from './assets/MultiTouchClickerGame.module.css';

interface TouchPoint {
  id: number;
  x: number;
  y: number;
}

const MAX_TAPS = 2000; // Максимальна кількість дотиків
const REGENERATION_INTERVAL = 8 * 60 * 60 * 1000; // Інтервал відновлення в мілісекундах (8 годин)

const HapticFeedbackDemo: FC = () => {
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [touchPoints, setTouchPoints] = useState<TouchPoint[]>([]);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [availableTaps, setAvailableTaps] = useState<number>(MAX_TAPS); // Доступні дотики

  const [impactOccurred] = useHapticFeedback();

  // Функція для обробки початку торкання
  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    event.preventDefault();
    const touches = event.touches;
    const coinRect = event.currentTarget.getBoundingClientRect();
    const newTouchPoints: TouchPoint[] = Array.from(touches).map((touch, index) => ({
      id: Date.now() + index,
      x: touch.clientX - coinRect.left,
      y: touch.clientY - coinRect.top,
    }));
    setTouchPoints((prevTouchPoints) => [...prevTouchPoints, ...newTouchPoints]);
    setCurrentScore((prevScore) => prevScore + touches.length);
    setTotalScore((prevTotalScore) => prevTotalScore + touches.length);

    // Зменшуємо доступні дотики на кількість дотиків
    setAvailableTaps((prevAvailableTaps) => Math.max(prevAvailableTaps - touches.length, 0));

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
          tiltAngleY = (touch.clientX - centerX) / 10;
        }

        coin.style.transition = 'none';
        coin.style.transform = `scale(0.9) rotateX(${tiltAngleX}deg) rotateY(${tiltAngleY}deg)`;
      });

      coin.classList.add(styles.active);
      setTimeout(() => {
        coin.classList.remove(styles.active);
        coin.style.transition = '';
        coin.style.transform = `scale(0.9) rotateX(0deg) rotateY(0deg)`;
      }, 100);
    }
  };

  // Ефект для відновлення доступних дотиків кожні 8 годин
  useEffect(() => {
    const timer = setInterval(() => {
      setAvailableTaps((prev) => Math.min(prev + 1, MAX_TAPS));
    }, REGENERATION_INTERVAL);

    return () => clearInterval(timer);
  }, []);

  // Функція для відображення точок дотику з анімацією
  const renderTouchPoints = () => {
    return touchPoints.map((point) => (
        <div
            key={point.id}
            className={styles.touchPoint}
            style={{ left: point.x - 50, top: point.y - 50 }}
        >
          +1
        </div>
    ));
  };

  return (
      <div className={styles.gameContainer}>
        <div className={styles.buttonContainer}>
          <div className={styles.coinButton}>
            <div className={styles.coinContainer}>
              <img
                  onClick={() => impactOccurred("medium")}
                  onTouchStart={handleTouchStart}
                  src={coinImage}
                  className={styles.coin}
                  alt="Coin"
              />
              {renderTouchPoints()}
            </div>
          </div>
        </div>
        <div className={styles.totalScore}>
          Total Score: {totalScore}
        </div>
        <div className={styles.progressContainer}>
          <div className={styles.progressBar} style={{ width: `${(availableTaps / MAX_TAPS) * 100}%` }} />
          <div className={styles.progressBarText}>
            {availableTaps}/{MAX_TAPS}
          </div>
        </div>
      </div>
  );
};

export default HapticFeedbackDemo;

