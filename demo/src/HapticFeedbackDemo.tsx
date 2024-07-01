import React, {FC, useCallback, useEffect, useRef, useState} from 'react';
import { useHapticFeedback } from '@vkruglikov/react-telegram-web-app';
import coinImage from './assets/image/coin.png';
import styles from './assets/MultiTouchClickerGame.module.css';

interface TouchPoint {
  id: number;
  x: number;
  y: number;
}

const MAX_TAPS = 2000;
const REGENERATION_INTERVAL = 1 * 60 * 60 * 1000;

const INITIAL_UPGRADE_COST = 1500;
const UPGRADE_COST_INCREMENT = 1500;
const INITIAL_SCORE_PER_TAP = 1;

const HapticFeedbackDemo: React.FC = () => {
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [touchPoints, setTouchPoints] = useState<TouchPoint[]>([]);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [availableTaps, setAvailableTaps] = useState<number>(MAX_TAPS);
  const [scorePerTap, setScorePerTap] = useState<number>(INITIAL_SCORE_PER_TAP);

  const [impactOccurred] = useHapticFeedback();
  const animationFrameId = useRef<number | null>(null);

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
    setCurrentScore((prevScore) => prevScore + touches.length * scorePerTap);
    setTotalScore((prevTotalScore) => prevTotalScore + touches.length * scorePerTap);

    if (availableTaps > 0) {
      setAvailableTaps((prevAvailableTaps) => Math.max(prevAvailableTaps - touches.length, 0));
    }

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
          tiltAngleX = -(centerY - touch.clientY) / 6;
        } else if (touch.clientY > centerY) {
          tiltAngleX = (touch.clientY - centerY) / 6;
        }

        if (touch.clientX < centerX) {
          tiltAngleY = -(centerX - touch.clientX) / 6;
        } else if (touch.clientX > centerX) {
          tiltAngleY = (touch.clientX - centerX) / 6;
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
  }, [availableTaps]);

  const renderTouchPoints = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    animationFrameId.current = requestAnimationFrame(() => {
      setTouchPoints((prevTouchPoints) => prevTouchPoints.slice(0, 10));
    });

    return touchPoints.map((point) => (
        <div
            key={point.id}
            className={styles.touchPoint}
            style={{ left: point.x - 50, top: point.y - 50 }}
        >
          +{scorePerTap}
        </div>
    ));
  }, [touchPoints, scorePerTap]);

  const upgradeScorePerTap = () => {
    const upgradeCost = INITIAL_UPGRADE_COST + Math.floor(totalScore / UPGRADE_COST_INCREMENT) * UPGRADE_COST_INCREMENT;
    if (totalScore >= upgradeCost) {
      setScorePerTap((prevScorePerTap) => prevScorePerTap + 1);
      setTotalScore((prevTotalScore) => prevTotalScore - upgradeCost);
    } else {
      alert(`Not enough ${upgradeCost} points for upgrade!`);
    }
  };

  const upgradeTapsLimit = () => {
    const upgradeCost = 1500 + Math.floor(totalScore / UPGRADE_COST_INCREMENT) * UPGRADE_COST_INCREMENT;
    if (totalScore >= upgradeCost) {
      setAvailableTaps((prevAvailableTaps) => prevAvailableTaps + 1000);
      setTotalScore((prevTotalScore) => prevTotalScore - upgradeCost);
    } else {
      alert(`Not enough ${upgradeCost} points for upgrade!`);
    }
  };

  const upgradeProgress1 = (totalScore / (INITIAL_UPGRADE_COST + Math.floor(totalScore / UPGRADE_COST_INCREMENT) * UPGRADE_COST_INCREMENT)) * 100;
  const upgradeProgress2 = (totalScore / (1500 + Math.floor(totalScore / UPGRADE_COST_INCREMENT) * UPGRADE_COST_INCREMENT)) * 100;

  return (
      <div className={styles.gameContainer}>
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
        <div className={styles.totalScore}>
          Total Score: {totalScore}
        </div>
        <div className={styles.progressBarText}>
          {availableTaps}/{MAX_TAPS}
        </div>
        <div className={styles.progressContainer}>
          <div className={styles.progressBar} style={{ width: `${(availableTaps / MAX_TAPS) * 100}%` }} />
        </div>
        <div className={styles.upgradesContainer}>
          <button
              onClick={upgradeScorePerTap}
              className={styles.upgradeButton}
              style={{
                backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0) ${upgradeProgress1}%, #bf05ff ${upgradeProgress1}%)`,
                pointerEvents: totalScore >= INITIAL_UPGRADE_COST ? 'auto' : 'none',
              }}
          >
            Upgrade (+1)
          </button>
          <button
              onClick={upgradeTapsLimit}
              className={styles.upgradeButton}
              style={{
                backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0) ${upgradeProgress2}%, #bf05ff ${upgradeProgress2}%)`,
                pointerEvents: totalScore >= 1500 ? 'auto' : 'none',
              }}
          >
            Upgrade Taps (+1000)
          </button>
        </div>
      </div>
  );
};

export default HapticFeedbackDemo;
