import React, { useEffect, useState } from 'react';
import { useHapticFeedback } from '@vkruglikov/react-telegram-web-app';
import coinImage from './assets/image/coin.png';
import styles from './assets/MultiTouchClickerGame.module.css';

const REGENERATION_INTERVAL = 1 * 60 * 60 * 1000;
const INITIAL_UPGRADE_COST = 2000; // Начальная стоимость апгрейда
const UPGRADE_COST_INCREMENT = 1000; // Увеличение стоимости апгрейда
const INITIAL_SCORE_PER_TAP = 110000;
const MAX_LEVEL = 20; // Максимальный уровень апгрейда

const HapticFeedbackDemo: React.FC = () => {
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [touchPoints, setTouchPoints] = useState<{ id: number; x: number; y: number; }[]>([]);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [availableTaps, setAvailableTaps] = useState<number>(2000); // Начальное количество тапов
  const [scorePerTap, setScorePerTap] = useState<number>(INITIAL_SCORE_PER_TAP);
  const [impactOccurred] = useHapticFeedback();
  const [upgradeLevel, setUpgradeLevel] = useState<number>(0); // Уровень апгрейда

  // Максимальное количество тапов на текущем уровне
  const MAX_TAPS = 2000 + upgradeLevel * 1000;

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    event.preventDefault();
    const touches = event.touches;
    const coinRect = event.currentTarget.getBoundingClientRect();
    const newTouchPoints = Array.from(touches).map((touch, index) => ({
      id: Date.now() + index,
      x: touch.clientX - coinRect.left,
      y: touch.clientY - coinRect.top,
    }));
    setTouchPoints((prevTouchPoints) => [...prevTouchPoints, ...newTouchPoints]);
    setCurrentScore((prevScore) => prevScore + touches.length * scorePerTap);
    setTotalScore((prevTotalScore) => prevTotalScore + touches.length * scorePerTap);

    // Уменьшаем доступные тапы при каждом нажатии на монету
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

  useEffect(() => {
    const timer = setInterval(() => {
      if (availableTaps < MAX_TAPS) {
        setAvailableTaps((prev) => Math.min(prev + 1, MAX_TAPS));
      }
    }, REGENERATION_INTERVAL);

    return () => clearInterval(timer);
  }, [availableTaps, MAX_TAPS]);

  const renderTouchPoints = () => {
    return touchPoints.map((point) => (
        <div key={point.id} className={styles.touchPoint} style={{ left: point.x - 50, top: point.y - 50 }}>
          +{scorePerTap}
        </div>
    ));
  };

  const upgradeScorePerTap = () => {
    const currentUpgradeCost = INITIAL_UPGRADE_COST + upgradeLevel * UPGRADE_COST_INCREMENT;
    if (totalScore >= currentUpgradeCost && upgradeLevel < MAX_LEVEL) {
      setScorePerTap((prevScorePerTap) => prevScorePerTap + 1);
      setTotalScore((prevTotalScore) => prevTotalScore - currentUpgradeCost);
      setUpgradeLevel((prevLevel) => prevLevel + 1);
    } else {
      alert(`Not enough points or maximum level reached!`);
    }
  };

  const upgradeTapsLimit = () => {
    const currentUpgradeCost = INITIAL_UPGRADE_COST + upgradeLevel * UPGRADE_COST_INCREMENT;
    if (totalScore >= currentUpgradeCost && upgradeLevel < MAX_LEVEL) {
      setTotalScore((prevTotalScore) => prevTotalScore - currentUpgradeCost);
      setUpgradeLevel((prevLevel) => prevLevel + 1);
    } else {
      alert(`Not enough points or maximum level reached!`);
    }
  };

  const upgradeProgress1 = (totalScore / (INITIAL_UPGRADE_COST + upgradeLevel * UPGRADE_COST_INCREMENT)) * 100;
  const upgradeProgress2 = (totalScore / (INITIAL_UPGRADE_COST + upgradeLevel * UPGRADE_COST_INCREMENT)) * 100;

  return (
      <div className={styles.gameContainer}>
        <div className={styles.coinButton}>
          <div className={styles.coinContainer}>
            <img
                onClick={() => impactOccurred("rigid")}
                onTouchStart={handleTouchStart}
                src={coinImage}
                className={styles.coin}
                alt="Coin"
            />
            {renderTouchPoints()}
          </div>
        </div>

        <div className={styles.progressContainer}>
          <div className={styles.progressBarContainer}>
            <div className={styles.progressBar} />
            <div className={styles.progressBarFill} style={{ width: `${(availableTaps / MAX_TAPS) * 100}%` }} />
          </div>
          <div className={styles.progressBarText}>
            {availableTaps}/{MAX_TAPS}
          </div>
        </div>
        <div className={styles.totalScore}>
          Total Score: {totalScore}
        </div>
        <div className={styles.upgradesContainer}>
          <button
              onClick={upgradeScorePerTap}
              className={styles.upgradeButton}
              style={{
                backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0) ${upgradeProgress1}%, #bf05ff ${upgradeProgress1}%)`,
                pointerEvents: totalScore >= (INITIAL_UPGRADE_COST + upgradeLevel * UPGRADE_COST_INCREMENT) && upgradeLevel < MAX_LEVEL ? 'auto' : 'none',
              }}
          >
            Upgrade (+1)
          </button>
          <button
              onClick={upgradeTapsLimit}
              className={styles.upgradeButton}
              style={{
                backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0) ${upgradeProgress2}%, #bf05ff ${upgradeProgress2}%)`,
                pointerEvents: totalScore >= (INITIAL_UPGRADE_COST + upgradeLevel * UPGRADE_COST_INCREMENT) && upgradeLevel < MAX_LEVEL ? 'auto' : 'none',
              }}
          >
            Upgrade Taps (+1000)
          </button>
        </div>
      </div>
  );
};

export default HapticFeedbackDemo;
