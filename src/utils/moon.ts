import SunCalc from "suncalc";

export const moonCycleTime = 29.530588853 * 24 * 60 * 60 * 1000;
export const approximationConstant = 0.55228474983079;

export interface Point {
  x: number;
  y: number;
}

export const calculateMoonPath = (age: number, radius: number, cx: number, cy: number) => {
  const waxingCycle = Math.min(1, age * 2);
  const waxing = -1 + waxingCycle * 2;
  const waningCycle = Math.max(0, (age - 0.5) * 2);
  const waning = 1 - waningCycle * 2;

  const x = cx;
  const y = cy;
  const c = approximationConstant * radius;

  const A = { x, y: y - radius };
  const AB = { x: x + c * waning, y: y - radius };
  const BA = { x: x + radius * waning, y: y - c };
  const B = { x: x + radius * waning, y };
  const BC = { x: x + radius * waning, y: y + c };
  const CB = { x: x + c * waning, y: y + radius };
  const C = { x, y: y + radius };
  const CD = { x: x - c * waxing, y: y + radius };
  const DC = { x: x - radius * waxing, y: y + c };
  const D = { x: x - radius * waxing, y };
  const DA = { x: x - radius * waxing, y: y - c };
  const AD = { x: x - c * waxing, y: y - radius };

  return `M ${A.x},${A.y} C ${AB.x},${AB.y} ${BA.x},${BA.y} ${B.x},${B.y} C ${BC.x},${BC.y} ${CB.x},${CB.y} ${C.x},${C.y} C ${CD.x},${CD.y} ${DC.x},${DC.y} ${D.x},${D.y} C ${DA.x},${DA.y} ${AD.x},${AD.y} ${A.x},${A.y} Z`;
};

export const getCurrentMoonPhase = (time: number) => {
  return SunCalc.getMoonIllumination(new Date(time)).phase;
};

export const findNextNewMoon = () => {
  let left = Date.now();
  let right = left + moonCycleTime;

  while (right - left > 1000) {
    const mid = Math.floor((left + right) / 2);
    const phase = SunCalc.getMoonIllumination(new Date(mid)).phase;

    if (phase < 0.0001 || phase > 0.9999) {
      return new Date(mid);
    }

    if (phase > 0.5) {
      left = mid;
    } else {
      right = mid;
    }
  }

  return new Date(right);
}; 