import React, { useEffect, useState } from 'react';
import { useHapticFeedback } from '@vkruglikov/react-telegram-web-app';
import coinImage from './assets/image/coin.png';
import styles from './assets/MultiTouchClickerGame.module.css';

interface TouchPoint {
  id: number;
  x: number;
  y: number;
}

const REGENERATION_INTERVAL = 1.2 * 1000;
const REGENERATION_DELAY = 5 * 1000;

const INITIAL_UPGRADE_COST = 1500;
const UPGRADE_COST_INCREMENT = 1500;
const INITIAL_SCORE_PER_TAP = 100;

const HapticFeedbackDemo: React.FC = () => {
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [touchPoints, setTouchPoints] = useState<TouchPoint[]>([]);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [availableTaps, setAvailableTaps] = useState<number>(2000); // Initial available taps
  const [scorePerTap, setScorePerTap] = useState<number>(INITIAL_SCORE_PER_TAP);
  const [maxTaps, setMaxTaps] = useState<number>(2000); // Initial max taps
  const [upgradeCompleted, setUpgradeCompleted] = useState<boolean>(false);
  const [showExplosion, setShowExplosion] = useState<boolean>(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);

  const [impactOccurred] = useHapticFeedback();

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    event.preventDefault();
    const touches = event.touches;
    const coinRect = event.currentTarget.getBoundingClientRect();

    if (scorePerTap <= availableTaps) {
      const newTouchPoints: TouchPoint[] = Array.from(touches).map((touch, index) => ({
        id: Date.now() + index,
        x: touch.clientX - coinRect.left,
        y: touch.clientY - coinRect.top,
      }));
      setTouchPoints((prevTouchPoints) => [...prevTouchPoints, ...newTouchPoints]);
      setCurrentScore((prevScore) => prevScore + touches.length * scorePerTap);
      setTotalScore((prevTotalScore) => prevTotalScore + touches.length * scorePerTap);

      if (availableTaps > 0) {
        setAvailableTaps((prevAvailableTaps) => Math.max(prevAvailableTaps - scorePerTap, 0));
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
            tiltAngleX = -(centerY - touch.clientY) / 5;
          } else if (touch.clientY > centerY) {
            tiltAngleX = (touch.clientY - centerY) / 5;
          }

          if (touch.clientX < centerX) {
            tiltAngleY = -(centerX - touch.clientX) / 5;
          } else if (touch.clientX > centerX) {
            tiltAngleY = (touch.clientX - centerX) / 5;
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
    } else {
      console.log('Score per tap is greater than available taps. Ignoring touch.');
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      if (availableTaps < maxTaps) {
        setAvailableTaps((prev) => Math.min(prev + 1, maxTaps));
      }
    }, REGENERATION_INTERVAL);

    return () => clearInterval(timer);
  }, [availableTaps, maxTaps]);

  useEffect(() => {
    const regenerationDelayTimer = setTimeout(() => {
      const regenerationTimer = setInterval(() => {
        if (availableTaps === 0) {
          setAvailableTaps((prevAvailableTaps) => prevAvailableTaps + 1);
        }
      }, REGENERATION_INTERVAL);

      return () => clearInterval(regenerationTimer);
    }, REGENERATION_DELAY);

    return () => clearTimeout(regenerationDelayTimer);
  }, []);

  const renderTouchPoints = () => {
    return touchPoints.map((point) => (
        <div
            key={point.id}
            className={styles.touchPoint}
            style={{ left: point.x - 50, top: point.y - 50 }}
        >
          +{scorePerTap}
        </div>
    ));
  };

  const renderParticles = () => {
    return particles.map((particle) => (
        <div
            key={particle.id}
            className={styles.particle}
            style={{ left: particle.x, top: particle.y }}
        />
    ));
  };

  const createParticles = (x: number, y: number, width: number) => {
    const newParticles = Array.from({ length: 200 }).map((_, index) => ({
      id: Date.now() + index,
      x: x + Math.random() * width,
      y: y + Math.random() * 20 - 10,
    }));
    setParticles(newParticles);

    setTimeout(() => {
      setParticles([]);
    }, 2000);
  };

  const upgradeScorePerTap = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    const currentLevel = Math.floor((scorePerTap - INITIAL_SCORE_PER_TAP) / UPGRADE_COST_INCREMENT) + 1;
    const upgradeCost = INITIAL_UPGRADE_COST * Math.pow(2, currentLevel - 1);

    if (totalScore >= upgradeCost) {
      setScorePerTap((prevScorePerTap) => prevScorePerTap + currentLevel); // Increment by current level
      setTotalScore((prevTotalScore) => prevTotalScore - upgradeCost);
      setUpgradeCompleted(true);

      setShowExplosion(true);
      const buttonRect = event.currentTarget.getBoundingClientRect();
      createParticles(buttonRect.left, buttonRect.top, buttonRect.width);

      setTimeout(() => {
        setShowExplosion(false);
      }, 2000);
    } else {
      alert(`Not enough ${upgradeCost} points for upgrade!`);
    }
  };

  const upgradeTapsLimit = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    const currentLevel = Math.floor((maxTaps / 1000 - 2) / UPGRADE_COST_INCREMENT) + 1;
    const upgradeCost = INITIAL_UPGRADE_COST * Math.pow(2, currentLevel - 1);

    if (totalScore >= upgradeCost) {
      setTotalScore((prevTotalScore) => prevTotalScore - upgradeCost);
      setMaxTaps((prevMaxTaps) => prevMaxTaps + 1000);

      setShowExplosion(true);
      const buttonRect = event.currentTarget.getBoundingClientRect();
      createParticles(buttonRect.left, buttonRect.top, buttonRect.width);

      setTimeout(() => {
        setShowExplosion(false);
      }, 2000);
    } else {
      alert(`Not enough ${upgradeCost} points for upgrade!`);
    }
  };


  const upgradeScorePerTapCost = () => {
    const level = Math.floor((scorePerTap - INITIAL_SCORE_PER_TAP) / UPGRADE_COST_INCREMENT) + 1;
    return INITIAL_UPGRADE_COST + level * UPGRADE_COST_INCREMENT;
  };



  const upgradeTapsLimitCost = () => {
    const currentLevel = Math.floor((maxTaps / 1000 - 2) / UPGRADE_COST_INCREMENT) + 1;
    return INITIAL_UPGRADE_COST * Math.pow(2, currentLevel - 1);
  };

  const upgradeScorePerTapProgress = Math.min((totalScore / upgradeScorePerTapCost()) * 100, 100);
  const upgradeTapsLimitProgress = Math.min((totalScore / upgradeTapsLimitCost()) * 100, 100);

  return (
      <div className={styles.gameContainer}>
        <div className={styles.coinButton}>
          <div className={styles.coinContainer}>
            <img
                onClick={() => impactOccurred('rigid')}
                onTouchStart={handleTouchStart}
                src={coinImage}
                className={styles.coin}
                alt="Coin"
            />
            {renderTouchPoints()}
          </div>
        </div>
        <div className={styles.totalScore}>Total Score: {totalScore}</div>
        <div className={styles.progressBarText}>
          {availableTaps}/{maxTaps}
        </div>
        <div className={styles.progressContainer}>
          <div className={styles.progressBar} style={{ width: `${(availableTaps / maxTaps) * 100}%` }} />
        </div>
        <div className={styles.upgradesContainer}>
          <button
              onClick={upgradeScorePerTap}
              className={styles.upgradeButton}
              style={{
                backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0) ${upgradeScorePerTapProgress}%, #bf05ff ${upgradeScorePerTapProgress}%)`,
                pointerEvents: totalScore >= upgradeScorePerTapCost() ? 'auto' : 'none',
              }}
          >
            Upgrade (+{scorePerTap - INITIAL_SCORE_PER_TAP + 1})
            <br/>
            {upgradeScorePerTapProgress.toFixed(0)}%
            <br/>
            {upgradeScorePerTapCost()} points
            {showExplosion && <div className={styles.explosion} onAnimationEnd={() => setShowExplosion(false)}/>}
          </button>


          <button
              onClick={upgradeTapsLimit}
              className={styles.upgradeButton}
              style={{
                backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0) ${upgradeTapsLimitProgress}%, #bf05ff ${upgradeTapsLimitProgress}%)`,
                pointerEvents: totalScore >= upgradeTapsLimitCost() ? 'auto' : 'none',
              }}
          >
            Upgrade Taps (+1000)
            {showExplosion && <div className={styles.explosion} onAnimationEnd={() => setShowExplosion(false)}/>}
          </button>
        </div>
        {renderParticles()}
      </div>
  );
};

export default HapticFeedbackDemo;

