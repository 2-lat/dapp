"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll } from "motion/react";
import { ArrowDown } from "lucide-react";

type Point = [number, number];

const MAX_POINTS = 96;

const generatePoints = (segments: number, radius: number = 200): Point[] => {
  const centerX = 500;
  const centerY = 500;
  const defaultPoint: Point = [centerX, centerY];
  const points: Point[] = Array(MAX_POINTS).fill(defaultPoint);

  if (segments === 1) {
    return points;
  }

  if (segments === 2) {
    // points[0] = [centerX + radius, centerY];
    for (let i = 0; i < MAX_POINTS; i++) {
      const progress = i / MAX_POINTS;
      if (progress <= 0.33) {
        points[i] = [centerX + radius * 2, centerY];
      } else {
        points[i] = [centerX - radius * 2, centerY];
      }
    }

    return points;
  }

  for (let i = 0; i < MAX_POINTS; i++) {
    const segment = Math.floor((i / MAX_POINTS) * segments);
    const angle = (segment / segments) * Math.PI * 2;// - Math.PI / 2;
    points[i] = [
      centerX + radius * Math.cos(angle),
      centerY + radius * Math.sin(angle),
    ];
  }

  //   if (segments === 1) {
  //     // Dot
  //     points[0] = defaultPoint;
  //     return points;
  //   }

  //   if (segments === 2) {
  //     // Line
  //     points[0] = [centerX - radius, centerY];
  //     points[1] = [centerX + radius, centerY];
  //     return points;
  //   }

  //   if (segments === 3) {
  //     // Triangle
  //     points[0] = [centerX, centerY - radius];
  //     points[1] = [centerX + radius * Math.cos(Math.PI / 6), centerY + radius * Math.sin(Math.PI / 6)];
  //     points[2] = [centerX - radius * Math.cos(Math.PI / 6), centerY + radius * Math.sin(Math.PI / 6)];
  //     return points;
  //   }

  //   if (segments === 5) {
  //     // Octagon (using 5 points for better morphing)
  //     for (let i = 0; i < 5; i++) {
  //       const angle = (i / 5) * Math.PI * 2;
  //       points[i] = [centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle)];
  //     }
  //     return points;
  //   }

  //   if (segments === 9) {
  //     // 9-point shape
  //     for (let i = 0; i < 9; i++) {
  //       const angle = (i / 9) * Math.PI * 2;
  //       points[i] = [centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle)];
  //     }
  //     return points;
  //   }

  //   if (segments === MAX_POINTS) {
  //     // MAX_POINTS-point shape
  //     for (let i = 0; i < MAX_POINTS; i++) {
  //       const angle = (i / MAX_POINTS) * Math.PI * 2;
  //       points[i] = [centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle)];
  //     }
  //     return points;
  //   }

  return points;
};

const interpolatePoints = (
  points1: Point[],
  points2: Point[],
  progress: number,
): Point[] => {
  const result: Point[] = [];
  const maxPoints = MAX_POINTS; // Always use MAX_POINTS points
  const defaultPoint = points1[0] || [500, 500];

  for (let i = 0; i < maxPoints; i++) {
    const p1: Point = points1[i] || defaultPoint;
    const p2: Point = points2[i] || defaultPoint;
    const x = p1[0] + (p2[0] - p1[0]) * progress;
    const y = p1[1] + (p2[1] - p1[1]) * progress;
    result.push([x, y] as Point);
  }

  return result;
};

const pointsToPath = (points: Point[]): string => {
  const [firstPoint, ...rest] = points;
  if (!firstPoint) return "M 500 500 Z";
  return `M ${firstPoint[0]} ${firstPoint[1]} ${rest
    .map((p) => `L ${p[0]} ${p[1]}`)
    .join(" ")} Z`;
};

export const AnimatedSVG = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  let segments = [];
  for (let i = MAX_POINTS; i > 1; i = Math.ceil(i / 2)) {
    segments.push(i);
  }
  segments.push(1);
  segments = segments.reverse();
  const segmentsCount = segments.length;

  const allPoints = segments.map((s) => generatePoints(s));
  const defaultPoints = generatePoints(1);
  const [currentPath, setCurrentPath] = useState(() =>
    pointsToPath(defaultPoints),
  );

  const [points, setPoints] = useState(defaultPoints);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest: number) => {
      const stage = Math.min(Math.floor(latest * segmentsCount), segmentsCount - 1);
      const progress = latest * segmentsCount - stage;
      const currentPoints = allPoints[stage] || defaultPoints;
      const nextPoints =
        allPoints[Math.min(stage + 1, allPoints.length - 1)] || defaultPoints;
      const interpolatedPoints = interpolatePoints(
        currentPoints,
        nextPoints,
        progress,
      );
      setPoints(interpolatedPoints);
      setCurrentPath(pointsToPath(interpolatedPoints));
    });

    return () => unsubscribe();
  }, [scrollYProgress, allPoints]);

  return (
    <div ref={containerRef} className="relative h-[400vh] w-full">
      <motion.svg
        width="100%"
        height="100%"
        viewBox="0 0 1000 1000"
        className="sticky top-0 h-screen w-full"
      >
        <motion.path
          d={currentPath}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="2"
          className="text-foreground"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5 }}
        />
        {points.map((p, i) => (
          <g key={i} opacity={0.5}>
            <circle key={i} cx={p[0]} cy={p[1]} r="10" fill="red" />
            <text
              x={p[0]}
              y={p[1]}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
            >
              {i}
            </text>
          </g>
        ))}
      </motion.svg>

      {/* Text content */}
      <div className="absolute top-0 z-10 w-full text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: scrollYProgress.get() < 0.2 ? 1 : 0 }}
          className="mb-4 text-4xl font-bold"
        >
          Enter quietly
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity:
              scrollYProgress.get() >= 0.2 && scrollYProgress.get() < 0.4
                ? 1
                : 0,
          }}
          className="text-muted-foreground text-2xl"
        >
          below the noise
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: scrollYProgress.get() < 0.2 ? 1 : 0 }}
          className="mt-8"
        >
          <ArrowDown className="mx-auto h-8 w-8 animate-bounce" />
        </motion.div>
      </div>
    </div>
  );
};
