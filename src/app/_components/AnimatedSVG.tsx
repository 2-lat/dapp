"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowDown } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useMounted } from "@/hooks/useMounted";

type Point = [number, number];

const MAX_POINTS = 48;

let SEGMENTS = [];
for (let i = MAX_POINTS; i > 1; i = Math.ceil(i / 2)) {
  SEGMENTS.push(i);
}
SEGMENTS.push(1);
SEGMENTS = SEGMENTS.reverse();
const SEGMENTS_COUNT = SEGMENTS.length;

const generatePoints = (SEGMENTS: number, radius: number = 200): Point[] => {
  const centerX = 500;
  const centerY = 500;
  const defaultPoint: Point = [centerX, centerY];
  const points: Point[] = Array(MAX_POINTS).fill(defaultPoint);

  if (SEGMENTS === 1) {
    return points;
  }

  if (SEGMENTS === 2) {
    // points[0] = [centerX + radius, centerY];
    for (let i = 0; i < MAX_POINTS; i++) {
      const progress = i / MAX_POINTS;
      if (progress <= 0.33) {
        points[i] = [centerX + radius * 3, centerY];
      } else {
        points[i] = [centerX - radius * 3, centerY];
      }
    }

    return points;
  }

  for (let i = 0; i < MAX_POINTS; i++) {
    const segment = Math.floor((i / MAX_POINTS) * SEGMENTS);
    const angle = (segment / SEGMENTS) * Math.PI * 2; // - Math.PI / 2;
    points[i] = [
      centerX + radius * Math.cos(angle),
      centerY + radius * Math.sin(angle),
    ];
  }

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
  const isMounted = useMounted();
  const { resolvedTheme: theme } = useTheme();

  const isWhite = theme === "light";

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY, scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const reverseScrollY = useTransform(scrollY, (y) => -y);

  const onStage = (stage: number) => {
    return stage / SEGMENTS_COUNT;
  };

  const fadeQuetly = useTransform(
    scrollYProgress,
    [onStage(0), onStage(0.5)],
    [1, 0],
    { clamp: true },
  );
  const fadeBelowTheNoise = useTransform(
    scrollYProgress,
    [onStage(0.5), onStage(1), onStage(1.5)],
    [0, 1, 0],
    { clamp: true },
  );
  const fadeShapeForms = useTransform(
    scrollYProgress,
    [onStage(2), onStage(2.5), onStage(4), onStage(4.5)],
    [0, 1, 1, 0],
    { clamp: true },
  );

  const fadeStand = useTransform(
    scrollYProgress,
    [onStage(4.5), onStage(6)],
    [0, 1],
    { clamp: true },
  );
  const starsScale = useTransform(
    scrollYProgress,
    [onStage(0), onStage(6)],
    [0, 1],
    { clamp: true },
  );
  const starsOpacity = useTransform(
    scrollYProgress,
    [onStage(0), onStage(6)],
    [0, 1],
    { clamp: true },
  );

  const allPoints = SEGMENTS.map((s) => generatePoints(s));
  const defaultPoints = generatePoints(1);
  const [currentPathRed, setCurrentPathRed] = useState(() =>
    pointsToPath(defaultPoints),
  );
  const [currentPathGreen, setCurrentPathGreen] = useState(() =>
    pointsToPath(defaultPoints),
  );
  const [currentPathBlue, setCurrentPathBlue] = useState(() =>
    pointsToPath(defaultPoints),
  );

  const [points, setPoints] = useState(defaultPoints);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest: number) => {
      const stage = Math.min(
        Math.floor(latest * SEGMENTS_COUNT),
        SEGMENTS_COUNT - 1,
      );
      const progress = latest * SEGMENTS_COUNT - stage;
      const currentPoints = allPoints[stage] || defaultPoints;
      const nextPoints =
        allPoints[Math.min(stage + 1, allPoints.length - 1)] || defaultPoints;
      setPoints(interpolatePoints(currentPoints, nextPoints, progress));
      setCurrentPathRed(
        pointsToPath(
          interpolatePoints(currentPoints, nextPoints, Math.pow(progress, stage === 1 ? 1 : 0.5)),
        ),
      );
      setCurrentPathGreen(
        pointsToPath(interpolatePoints(currentPoints, nextPoints, progress)),
      );
      setCurrentPathBlue(
        pointsToPath(
          interpolatePoints(currentPoints, nextPoints, Math.pow(progress, stage === 1 ? 1 : 1.5)),
        ),
      );
    });
    return () => unsubscribe();
  }, [scrollYProgress, allPoints]);

  if (!isMounted) return null;
  return (
    <div ref={containerRef} className="relative w-full">
      {!isWhite && (
        <motion.div
          className="fixed top-1/2 left-1/2 size-0"
          style={{
            opacity: starsOpacity,
            scale: starsScale,
          }}
        >
          <motion.div
            className="stars-1"
            style={{
              scale: starsScale,
            }}
          ></motion.div>
          <motion.div
            className="stars-2"
            style={{
              scale: starsScale,
            }}
          ></motion.div>
          <motion.div
            className="stars-3"
            style={{
              scale: starsScale,
            }}
          ></motion.div>
          <motion.div
            className="stars-4"
            style={{
              scale: starsScale,
            }}
          ></motion.div>
          <motion.div
            className="stars-5"
            style={{
              scale: starsScale,
            }}
          ></motion.div>
        </motion.div>
      )}
      <div className="text-foreground fixed top-0 z-10 mx-auto flex w-full flex-row items-center justify-center py-4">
        <div className="text-3xl">
          <span className="relative">
            o
            <span className="absolute left-1/2 -translate-x-1/2 translate-y-[0.04em] pr-[0.12em]">
              |
            </span>
            <span className="absolute left-1/2 -translate-x-1/2 translate-y-[0.04em] pl-[0.12em]">
              |
            </span>
          </span>
        </div>
      </div>
      <motion.svg
        width="100%"
        height="100%"
        viewBox="0 0 1000 1000"
        className="fixed top-0 h-screen w-full"
      >
        {isWhite ? (
          <motion.path
            d={currentPathGreen}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="1"
            className={`text-foreground`}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5 }}
          />
        ) : (
          [
            { blur: "blur-lg", thickness: "3" },
            { blur: "blur-xs", thickness: "2" },
            { blur: "blur-none", thickness: "1" },
          ].map(({ blur, thickness }) =>
            [
              { path: currentPathRed, color: "text-red-500" },
              { path: currentPathGreen, color: "text-green-500" },
              { path: currentPathBlue, color: "text-blue-500" },
            ].map(({ path, color }) => (
              <motion.path
                key={`${blur}-${color}`}
                d={path}
                fill="transparent"
                stroke="currentColor"
                strokeWidth={thickness}
                className={`${color} mix-blend-screen ${blur}`}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5 }}
              />
            )),
          )
        )}
        {false &&
          points.map((p, i) => (
            <g key={i}>
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
      <div className="fixed bottom-10 z-10 w-full text-center">
        <motion.div
          style={{ y: reverseScrollY, opacity: fadeQuetly }}
          className="text-muted-foreground flex flex-col items-center gap-y-2 text-lg"
        >
          <span>enter quietly</span>
          <span className="animate-bounce">↓</span>
        </motion.div>

        <div className="fixed top-1/2 w-full pt-10 text-center">
          <motion.div
            style={{
              opacity: fadeBelowTheNoise,
            }}
            className="text-muted-foreground text-2xl"
          >
            below the noise
          </motion.div>
        </div>

        <div className="fixed top-1/2 w-full -translate-y-1/2 text-center">
          <motion.div
            style={{
              opacity: fadeShapeForms,
            }}
            className="text-muted-foreground text-2xl"
          >
            a shape forms
          </motion.div>
        </div>

        <div className="fixed top-1/2 w-full -translate-y-1/2 text-center">
          <motion.div
            style={{
              opacity: fadeStand,
            }}
            className="text-foreground text-2xl"
          >
            the second latitude
          </motion.div>
        </div>
      </div>

      <div className="h-[400vh]"></div>

      <nav className="[&>a]:text-muted-foreground [&>a]:hover:text-foreground relative z-20 flex w-full items-center justify-center gap-x-12 py-4 [&>a]:p-4">
        <Link href="/manifesto" passHref>
          manifesto
        </Link>
        <Link href="/whitepaper" passHref>
          whitepaper
        </Link>
        <Link href="/observe" passHref>
          observe
        </Link>
      </nav>
    </div>
  );
};
