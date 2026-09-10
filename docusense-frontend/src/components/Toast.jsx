import React, { useEffect } from 'react';

export default function Toast({ message, onDone }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
  }, [message, onDone]);

  return (
    <div className={`toast ${message ? 'show' : ''}`}>{message}</div>
  );
}