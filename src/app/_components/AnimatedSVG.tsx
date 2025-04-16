"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
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

const generatePoints = (SEGMENTS: number, radius = 200): Point[] => {
  const centerX = 500;
  const centerY = 500;
  const defaultPoint: Point = [centerX, centerY];
  const points: Point[] = Array.from({ length: MAX_POINTS }, () => Object.assign({}, defaultPoint));

  if (SEGMENTS === 1) {
    return points;
  }

  if (SEGMENTS === 2) {
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
    const angle = (segment / SEGMENTS) * Math.PI * 2;
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
  const maxPoints = MAX_POINTS;
  const defaultPoint = points1[0] ?? [500, 500];

  for (let i = 0; i < maxPoints; i++) {
    const p1: Point = points1[i] ?? defaultPoint;
    const p2: Point = points2[i] ?? defaultPoint;
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
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

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

  const allPoints = SEGMENTS.map((s) => generatePoints(s));
  const defaultPoints = useMemo(() => generatePoints(1), []);
  const [currentPathRed, setCurrentPathRed] = useState(() =>
    pointsToPath(defaultPoints),
  );
  const [currentPathGreen, setCurrentPathGreen] = useState(() =>
    pointsToPath(defaultPoints),
  );
  const [currentPathBlue, setCurrentPathBlue] = useState(() =>
    pointsToPath(defaultPoints),
  );

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest: number) => {
      const stage = Math.min(
        Math.floor(latest * SEGMENTS_COUNT),
        SEGMENTS_COUNT - 1,
      );
      const progress = latest * SEGMENTS_COUNT - stage;
      const currentPoints = allPoints[stage] ?? defaultPoints;
      const nextPoints =
        allPoints[Math.min(stage + 1, allPoints.length - 1)] ?? defaultPoints;
      setCurrentPathRed(
        pointsToPath(
          interpolatePoints(
            currentPoints,
            nextPoints,
            Math.pow(progress, stage === 1 ? 1 : 0.5),
          ),
        ),
      );
      setCurrentPathGreen(
        pointsToPath(interpolatePoints(currentPoints, nextPoints, progress)),
      );
      setCurrentPathBlue(
        pointsToPath(
          interpolatePoints(
            currentPoints,
            nextPoints,
            Math.pow(progress, stage === 1 ? 1 : 1.5),
          ),
        ),
      );
    });
    return () => unsubscribe();
  }, [scrollYProgress, allPoints, defaultPoints]);

  const handleEnterScroll = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.scrollTo({
      top: window.innerHeight * 4,
      behavior: "smooth",
    });
  };

  if (!isMounted) return null;
  return (
    <div ref={containerRef} className="relative w-full">
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
          [{ blur: "c", thickness: "1" }].map(({ blur, thickness }) =>
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
      </motion.svg>

      {/* Text content */}
      <div className="fixed top-2/3 z-10 w-full text-center">
        <motion.a
          style={{ opacity: fadeQuetly }}
          className="group text-muted-foreground hover:text-foreground transition-colors flex flex-col items-center gap-y-2 text-lg"
          onClick={handleEnterScroll}
          href="#enter-quietly"
        >
          <span>enter quietly</span>
          <div className="group-hover:border-foreground/50 border-foreground/25 transition-colors mt-2 aspect-[4/9] rounded-full border p-2 py-4">
            <div className="relative animate-bounce">↓</div>
          </div>
        </motion.a>

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
    </div>
  );
};
