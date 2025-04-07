'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll } from 'motion/react';
import { ArrowDown } from 'lucide-react';

type Point = [number, number];

const generatePoints = (segments: number, radius: number = 200): Point[] => {
  const centerX = 500;
  const centerY = 500;
  const points: Point[] = Array(segments).fill([0, 0]);

  if (segments === 1) {
    return [[centerX, centerY]];
  }

  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points[i] = [x, y];
  }

  // For line, align all points in a straight line
  if (segments === 2) {
    points[0] = [centerX - radius, centerY];
    points[1] = [centerX + radius, centerY];
  }

  // For triangle, use three points
  if (segments === 3) {
    points[0] = [centerX, centerY - radius];
    points[1] = [centerX + radius * Math.cos(Math.PI / 6), centerY + radius * Math.sin(Math.PI / 6)];
    points[2] = [centerX - radius * Math.cos(Math.PI / 6), centerY + radius * Math.sin(Math.PI / 6)];
  }

  // For hexagon, use six points
  if (segments === 6) {
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      points[i] = [centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle)];
    }
  }

  // For rough circle (12 points)
  if (segments === 12) {
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      points[i] = [centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle)];
    }
  }

  // For smooth circle (24 points)
  if (segments === 24) {
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      points[i] = [centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle)];
    }
  }

  return points;
};

const interpolatePoints = (points1: Point[], points2: Point[], progress: number): Point[] => {
  const maxPoints = Math.max(points1.length, points2.length);
  const result: Point[] = [];

  for (let i = 0; i < maxPoints; i++) {
    const p1 = points1[i % points1.length] as Point;
    const p2 = points2[i % points2.length] as Point;
    const x = p1[0] + (p2[0] - p1[0]) * progress;
    const y = p1[1] + (p2[1] - p1[1]) * progress;
    result.push([x, y]);
  }

  return result;
};

const pointsToPath = (points: Point[]): string => {
  if (points.length === 0) return '';
  const firstPoint = points[0] as Point;
  if (points.length === 1) {
    return `M ${firstPoint[0]} ${firstPoint[1]} m -10, 0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0`;
  }
  return `M ${firstPoint[0]} ${firstPoint[1]} ${points.slice(1).map(p => `L ${p[0]} ${p[1]}`).join(' ')} Z`;
};

export const AnimatedSVG = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  const segments = [1, 2, 3, 5, 9, 17] as const;
  const allPoints: Point[][] = segments.map(s => generatePoints(s));
  const [currentPath, setCurrentPath] = useState(pointsToPath(allPoints[0]));

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest: number) => {
      const stage = Math.min(Math.floor(latest * 5), allPoints.length - 1);
      const progress = (latest * 5) - stage;
      const currentPoints = allPoints[stage] ?? allPoints[0];
      const nextPoints = allPoints[Math.min(stage + 1, allPoints.length - 1)] ?? allPoints[0];
      const interpolatedPoints = interpolatePoints(currentPoints, nextPoints, progress);
      setCurrentPath(pointsToPath(interpolatedPoints));
    });

    return () => unsubscribe();
  }, [scrollYProgress, allPoints]);

  return (
    <div ref={containerRef} className="h-[400vh] w-full relative">
      <motion.svg
        width="100%"
        height="100%"
        viewBox="0 0 1000 1000"
        className="sticky top-0 w-full h-screen"
      >
        <motion.path
          d={currentPath}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-foreground"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5 }}
        />
      </motion.svg>

      {/* Text content */}
      <div className="absolute text-center z-10 top-0 w-full">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: scrollYProgress.get() < 0.2 ? 1 : 0 }}
          className="text-4xl font-bold mb-4"
        >
          Enter quietly
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: scrollYProgress.get() >= 0.2 && scrollYProgress.get() < 0.4 ? 1 : 0 }}
          className="text-2xl text-muted-foreground"
        >
          below the noise
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: scrollYProgress.get() < 0.2 ? 1 : 0 }}
          className="mt-8"
        >
          <ArrowDown className="w-8 h-8 mx-auto animate-bounce" />
        </motion.div>
      </div>
    </div>
  );
}; 