import { useState, useRef } from 'react';
import styles from '../styles/RunawayButton.module.css';

const MESSAGES = [
  "C'mon, I really need to get rid of this 😭",
  "It looked so good on the hanger tho...",
  "Are you SURE sure? Like actually sure?",
  "This is your last chance to reconsider bestie",
  "Fine. FINE. I'll let you remove it. Rude.",
  "You're really doing this to me right now?",
  "The item is literally crying rn just so you know",
];

export default function RunawayButton({ onConfirm }) {
  const [attempts, setAttempts] = useState(0);
  const [message, setMessage] = useState(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isRunning, setIsRunning] = useState(false);
  const btnRef = useRef();
  const usedMessages = useRef([]);

  function getRandomMessage() {
    const unused = MESSAGES.filter(m => !usedMessages.current.includes(m));
    const pool = unused.length > 0 ? unused : MESSAGES;
    const msg = pool[Math.floor(Math.random() * pool.length)];
    usedMessages.current = [...usedMessages.current.slice(-3), msg];
    return msg;
  }

  function handleClick() {
    if (attempts >= 3) {
      onConfirm();
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    setMessage(getRandomMessage());
    setIsRunning(true);

    const maxX = 160;
    const maxY = 40;
    const randX = (Math.random() - 0.5) * maxX;
    const randY = (Math.random() - 0.5) * maxY;
    setPos({ x: randX, y: randY });

    setTimeout(() => {
      setPos({ x: 0, y: 0 });
      setIsRunning(false);
      setTimeout(() => setMessage(null), 1800);
    }, 600);
  }

  return (
    <div className={styles.wrap}>
      {message && <div className={styles.message}>{message}</div>}
      <button
        ref={btnRef}
        className={styles.btn + (attempts >= 3 ? ' ' + styles.btnSurrendered : '') + (isRunning ? ' ' + styles.btnRunning : '')}
        style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
        onClick={handleClick}
      >
        {attempts >= 3 ? 'fine, remove it' : 'remove'}
      </button>
    </div>
  );
}
