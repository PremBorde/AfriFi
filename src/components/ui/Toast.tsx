"use client";
import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  show: boolean;
  onDone: () => void;
}

export default function Toast({ message, show, onDone }: ToastProps) {
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    if (!show) return;
    setHiding(false);
    const hideTimer = setTimeout(() => setHiding(true), 2200);
    const doneTimer = setTimeout(() => { setHiding(false); onDone(); }, 2550);
    return () => { clearTimeout(hideTimer); clearTimeout(doneTimer); };
  }, [show, onDone]);

  if (!show && !hiding) return null;

  return (
    <div className={`toast ${hiding ? "hide" : ""}`} role="alert" aria-live="polite">
      {message}
    </div>
  );
}
