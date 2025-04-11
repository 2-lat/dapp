"use client";

import { useMounted } from "@/hooks/useMounted";
import {
  motion
} from "motion/react";
import { useTheme } from "next-themes";
import { useMemo, useState } from "react";
import SunCalc from "suncalc";

const moonCycleTime = 29.530588853 * 24 * 60 * 60 * 1000;


const approximationConstant = 0.55228474983079;

const calculatePath = (age: number, radius: number, cx: number, cy: number) => {
  const waxingCycle = Math.min(1, age * 2); // 0..0.5 -> 0..1
  const waxing = -1 + waxingCycle * 2;
  const waningCycle = Math.max(0, (age - 0.5) * 2); // 0.5..1 -> 0..1
  const waning = 1 - waningCycle * 2;

  const x = cx; // center x
  const y = cy; // center y
  const c = approximationConstant * radius;

  const A = { x: x, y: y - radius }; // Top point
  const AB = { x: x + c * waning, y: y - radius }; // Top right control point 1
  const BA = { x: x + radius * waning, y: y - c }; // Top right control point 2
  const B = { x: x + radius * waning, y: y }; // Right point
  const BC = { x: x + radius * waning, y: y + c }; // Bottom right control point 1
  const CB = { x: x + c * waning, y: y + radius }; // Bottom right control point 2
  const C = { x: x, y: y + radius }; // Bottom point
  const CD = { x: x - c * waxing, y: y + radius }; // Bottom left control point 1
  const DC = { x: x - radius * waxing, y: y + c }; // Bottom left control point 2
  const D = { x: x - radius * waxing, y: y }; // Left point
  const DA = { x: x - radius * waxing, y: y - c }; // Top left control point 1
  const AD = { x: x - c * waxing, y: y - radius }; // Top left control point 2

  return `M ${A.x},${A.y} C ${AB.x},${AB.y} ${BA.x},${BA.y} ${B.x},${B.y} C ${BC.x},${BC.y} ${CB.x},${CB.y} ${C.x},${C.y} C ${CD.x},${CD.y} ${DC.x},${DC.y} ${D.x},${D.y} C ${DA.x},${DA.y} ${AD.x},${AD.y} ${A.x},${A.y} Z`;
}

export const ObserveMoon = ({ nextMoon }: { nextMoon: number }) => {
  const [currentAge, setCurrentAge] = useState(
    SunCalc.getMoonIllumination(new Date()).phase,
  );


  const nextMoonTime = useMemo(() => {
    // Binary search for next new moon time
    let left = Date.now();
    let right = left + moonCycleTime; // One lunar cycle from now
    let steps = 0;

    while (right - left > 1000) {
      // Search until within 1 minute precision
      const mid = Math.floor((left + right) / 2);
      const phase = SunCalc.getMoonIllumination(new Date(mid)).phase;
      console.log(
        ++steps,
        phase,
        new Date(left).toLocaleDateString(),
        new Date(mid).toLocaleDateString(),
        new Date(right).toLocaleDateString(),
      );

      if (phase < 0.0001 || phase > 0.9999) {
        // Found new moon
        return new Date(mid);
      }

      // If phase is in first half of cycle, search second half
      if (phase > 0.5) {
        left = mid;
      } else {
        right = mid;
      }
    }

    return new Date(right); // Return closest approximation
  }, []);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setCurrentAge(SunCalc.getMoonIllumination(new Date()).phase);
  //   }, 1000);
  //   return () => clearInterval(interval);
  // }, []);

  const isMounted = useMounted();
  const { resolvedTheme: theme } = useTheme();
  const isLight = theme === "light";

  const radius = 200;


  const [ pathA, pathB, pathC ] = useMemo(() => {
    return [
      calculatePath((currentAge) % 1, radius, 500, 500),
      calculatePath((currentAge + 0.01) % 1, radius, 500, 500),
      calculatePath((currentAge + 0.02) % 1, radius, 500, 500),
    ];
  }, [currentAge, radius]);

  if (!isMounted) return null;

  return (
    <div className="flex flex-col items-center justify-center">
      <div>Next moon: {nextMoonTime.toLocaleString()}</div>

      <motion.svg
        width="100%"
        height="100%"
        viewBox="0 0 1000 1000"
        className="text-foreground fixed top-0 h-screen w-full"
      >
        <circle
          cx="500"
          cy="500"
          r={isLight ? "201" : "200"}
          fill={isLight ? "currentColor" : "transparent"}
          stroke="currentColor"
          strokeWidth="1"
        />
        {[
          { path: pathA, color: "text-[#f00]" },
          { path: pathB, color: "text-[#0f0]" },
          { path: pathC, color: "text-[#00f]" },
        ].map(({ path, color }) => (
          <motion.path
            key={color}
            id="circle-path"
            d={path}
            fill="currentColor"
            className={isLight ? "text-background" : `${color} mix-blend-screen`}
            strokeWidth="1"
          />
        ))}
      </motion.svg>
    </div>
  );
};
