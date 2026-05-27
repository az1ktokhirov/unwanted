"use client";

import { useState, useEffect } from "react";

function calcTime(target: string) {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 };
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
  };
}

interface Props {
  targetDate: string;
  labels: { days: string; hours: string; minutes: string; seconds: string };
}

export default function CountdownTimer({ targetDate, labels }: Props) {
  const [time, setTime] = useState(calcTime(targetDate));

  useEffect(() => {
    const interval = setInterval(() => setTime(calcTime(targetDate)), 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const units = [
    { value: time.d, label: labels.days },
    { value: time.h, label: labels.hours },
    { value: time.m, label: labels.minutes },
    { value: time.s, label: labels.seconds },
  ];

  return (
    <div className="flex items-center gap-3">
      {units.map(({ value, label }, i) => (
        <div key={label} className="flex items-center gap-3">
          <div className="text-center">
            <div className="font-bebas text-3xl text-white leading-none tabular-nums w-10">
              {String(value).padStart(2, "0")}
            </div>
            <div className="text-white/40 text-[9px] uppercase tracking-widest mt-0.5">{label}</div>
          </div>
          {i < units.length - 1 && (
            <span className="font-bebas text-2xl text-white/30 -mt-2">:</span>
          )}
        </div>
      ))}
    </div>
  );
}
