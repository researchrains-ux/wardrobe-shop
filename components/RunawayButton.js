import { useState, useRef, useEffect } from 'react';
import styles from '../styles/RunawayButton.module.css';

const MESSAGES = [
  "bro really? that was a good find",
  "you're actually doing this right now",
  "the audacity is unreal",
  "this item has been waiting for you specifically",
  "ok but just so you know, this one won't come back",
  "you'll be thinking about this at 3am",
  "genuinely cannot believe what I'm witnessing",
  "this is a mistake and deep down you know it",
  "the item:",
  "alright but don't come crying when it's gone",
];

export default function RunawayButton({ onConfirm, itemPrice }) {
  const [attempts, setAttempts] = useState(0);
  const [message, setMessage] = useState(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [surrendered, setSurrendered] = useState(false);
  const usedMessages = useRef([]);

  const moneyMessages = [
    `saving that €${itemPrice} for what exactly`,
    `one less coffee and this was yours. just saying`,
    `€${itemPrice} and you're hesitating. bold.`,
  ];

  const allMessages = [...MESSAGES, ...moneyMessages];

  function getRandomMessage() {
    const unused = allMessages.filter(m => !usedMessages.current.includes(m));
    const pool = unused.length > 0 ? unused : allMessages;
    const msg = pool[Math.floor(Math.random() * pool.length)];
    usedMessages.current = [...usedMessages.current.slice(-4), msg];
    return msg;
  }

  function getRandomPos() {
    const directions = [
      { x: 80 + Math.random() * 60, y: 0 },
      { x: -(80 + Math.random() * 60), y: 0 },
      { x: 40 + Math.random() * 40, y: -(20 + Math.random() * 20) },
      { x: -(40 + Math.random() * 40), y: -(20 + Math.random() * 20) },
      { x: 60 + Math.random() * 40, y: 20 + Math.random() * 15 },
      { x: -(60 + Math.random() * 40), y: 20 + Math.random() * 15 },
    ];
    return directions[Math.floor(Math.random() * directions.length)];
  }

  function handleClick() {
    if (surrendered) {
      onConfirm();
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    setMessage(getRandomMessage());

    if (newAttempts >= 3) {
      setPos({ x: 0, y: 0 });
      setSurrendered(true);
    } else {
      setPos(getRandomPos());
    }
  }

  return (
    <div className={styles.wrap}>
      {message && (
        <div className={styles.message}>
          {message}
          {message === "the item:" && <span className={styles.heartbreak}> &nbsp;💔</span>}
        </div>
      )}
      <button
        className={styles.btn + (surrendered ? ' ' + styles.btnSurrendered : '')}
        style={{ transform: `translate(${pos.x}px, ${pos.y}px)`, transition: attempts === 0 ? 'none' : 'transform 0.18s cubic-bezier(0.22, 1, 0.36, 1)' }}
        onClick={handleClick}
      >
        {surrendered ? 'fine.' : attempts === 1 ? 'remove??' : attempts === 2 ? 'remove...' : 'remove'}
      </button>
    </div>
  );
}
