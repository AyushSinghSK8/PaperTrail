import React from "react";

interface ProgressBarProps {
  percentage: number;
  className?: string;
  barColor?: string;
}

export function ProgressBar({
  percentage,
  className = "",
  barColor = "bg-indigo-600",
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(percentage)));

  return (
    <div className={`h-2.5 w-full overflow-hidden rounded-full bg-slate-100 ${className}`}>
      <div
        className={`h-full rounded-full ${barColor} transition-all duration-500 ease-out`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
