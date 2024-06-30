import {FC, useEffect, useState} from 'react';
import {
  ImpactOccurredFunction,
  NotificationOccurredFunction,
  useHapticFeedback,
} from '@vkruglikov/react-telegram-web-app';
import coinImage from './assets/image/coin.png';
import styles from './assets/MultiTouchClickerGame.module.css'
interface TouchPoint {
  id: number;
  x: number;
  y: number;
}
const HapticFeedbackDemo: FC = () => {
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [touchPoints, setTouchPoints] = useState<TouchPoint[]>([]);
  const [totalScore, setTotalScore] = useState<number>(0);

  const [impactOccurred, notificationOccurred, selectionChanged] =
    useHapticFeedback();
  const [style, setStyle] =
    useState<Parameters<ImpactOccurredFunction>[0]>('heavy');
  const [type, setType] =
    useState<Parameters<NotificationOccurredFunction>[0]>('error');
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
    setCurrentScore((prevScore) => {
      const newScore = prevScore + touches.length;
      setTotalScore((prevTotalScore) => prevTotalScore + touches.length);
      return newScore;
    });
    const coin = document.querySelector(`.${styles.coin}`);
    if (coin) {
      coin.classList.add('active');
    }
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const coin = document.querySelector(`.${styles.coin}`);
    if (coin) {
      coin.classList.remove('active');
    }
  };

  useEffect(() => {
    if (touchPoints.length > 0) {
      const timer = setTimeout(() => {
        setTouchPoints([]);
      }, 500); // тривалість анімації
      return () => clearTimeout(timer);
    }
  }, [touchPoints]);
  return (
      <>
        <div className={styles.gameContainer}>
          <div className={styles.buttonContainer}>
            <div className={styles.coinButton}>
              <div className={styles.coinContainer}
                   onTouchStart={handleTouchStart}
                   onTouchEnd={handleTouchEnd}
                   onClick={() => impactOccurred("medium")}
              >
                <img
                    src={coinImage}
                    className={styles.coin}
                    alt="Coin"
                    style={{width: '100px', height: '100px'}}

                />
                {touchPoints.map((point) => (
                    <div
                        key={point.id}
                        className={styles.touchPoint}
                        style={{left: point.x - 50, top: point.y - 50}}
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
        <div className={"gameContainer"}>
          <div className={"buttonContainer"}>
            <div className={"coinButton"}
                 onClick={() => impactOccurred("medium")}


            >
              <div

                  onTouchStart={handleTouchStart}
                  className={"coinContainer"}>
                <img
                    src={coinImage}
                    className={"coin"}
                    alt="Coin"
                    style={{width: '100px', height: '100px'}}

                />

                {touchPoints.map((point) => (
                    <div
                        key={point.id}
                        className={"touchPoint"}
                        style={{left: point.x - 50, top: point.y - 50}}
                    >
                      +1
                    </div>
                ))}
              </div>
            </div>
          </div>
          <div className={"totalScore"}>
            Total Score: {totalScore}
          </div>
        </div>
      </>
  );
};
export default HapticFeedbackDemo;
