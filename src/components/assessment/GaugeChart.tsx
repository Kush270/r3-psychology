import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface GaugeChartProps {
  value: number; // 0-100
  color: string;
  label: string;
}

export function GaugeChart({ value, color, label }: GaugeChartProps) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 300);
    return () => clearTimeout(timer);
  }, [value]);

  const radius = 120;
  const strokeWidth = 18;
  const center = 150;
  const startAngle = 135;
  const endAngle = 405;
  const totalAngle = endAngle - startAngle;

  const polarToCartesian = (angle: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: center + radius * Math.cos(rad),
      y: center + radius * Math.sin(rad),
    };
  };

  const describeArc = (start: number, end: number) => {
    const s = polarToCartesian(start);
    const e = polarToCartesian(end);
    const largeArc = end - start > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${largeArc} 1 ${e.x} ${e.y}`;
  };

  const valueAngle = startAngle + (animatedValue / 100) * totalAngle;

  // Tick marks for the gauge
  const ticks = [0, 25, 50, 75, 100];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col items-center"
    >
      <svg viewBox="0 0 300 220" className="w-full max-w-[320px]">
        {/* Background arc */}
        <path
          d={describeArc(startAngle, endAngle)}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Gradient zones */}
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(0, 84%, 60%)" />
            <stop offset="50%" stopColor="hsl(35, 95%, 50%)" />
            <stop offset="100%" stopColor="hsl(160, 45%, 40%)" />
          </linearGradient>
        </defs>

        {/* Colored arc background (subtle) */}
        <path
          d={describeArc(startAngle, endAngle)}
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          opacity={0.15}
        />

        {/* Value arc */}
        <path
          d={describeArc(startAngle, Math.max(valueAngle, startAngle + 1))}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />

        {/* Tick labels */}
        {ticks.map((tick) => {
          const angle = startAngle + (tick / 100) * totalAngle;
          const pos = polarToCartesian(angle);
          const outerPos = {
            x: center + (radius + 28) * Math.cos(((angle - 90) * Math.PI) / 180),
            y: center + (radius + 28) * Math.sin(((angle - 90) * Math.PI) / 180),
          };
          return (
            <g key={tick}>
              <line
                x1={pos.x}
                y1={pos.y}
                x2={center + (radius + 8) * Math.cos(((angle - 90) * Math.PI) / 180)}
                y2={center + (radius + 8) * Math.sin(((angle - 90) * Math.PI) / 180)}
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={1.5}
                opacity={0.4}
              />
              <text
                x={outerPos.x}
                y={outerPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-muted-foreground"
                fontSize="10"
                fontFamily="Inter, system-ui, sans-serif"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* Needle */}
        {(() => {
          const needleAngle = startAngle + (animatedValue / 100) * totalAngle;
          const needleLength = radius - 30;
          const needleRad = ((needleAngle - 90) * Math.PI) / 180;
          const tipX = center + needleLength * Math.cos(needleRad);
          const tipY = center + needleLength * Math.sin(needleRad);
          return (
            <g className="transition-all duration-1000 ease-out">
              <circle cx={center} cy={center} r={8} fill={color} opacity={0.9} />
              <circle cx={center} cy={center} r={4} fill="hsl(var(--card))" />
              <line
                x1={center}
                y1={center}
                x2={tipX}
                y2={tipY}
                stroke={color}
                strokeWidth={3}
                strokeLinecap="round"
              />
            </g>
          );
        })()}

        {/* Center value */}
        <text
          x={center}
          y={center + 45}
          textAnchor="middle"
          className="fill-foreground"
          fontSize="28"
          fontWeight="700"
          fontFamily="'Playfair Display', Georgia, serif"
        >
          {animatedValue}%
        </text>
      </svg>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-sm font-medium text-muted-foreground -mt-2"
      >
        Compliance Score
      </motion.p>
    </motion.div>
  );
}
