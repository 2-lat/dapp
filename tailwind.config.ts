import { keyframes } from "motion/react";
import type { Config } from "tailwindcss";


const generateRandomStars = (opacity: string, density: number) => {
    const stars = [];
    while(density > 0) {
        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.pow(Math.random(), 0.4) * 70;
        const rW = Math.cos(angle) * distance;
        const rH = Math.sin(angle) * distance;
        
        stars.push(`${rW}vw ${rH}vh oklch(var(--foreground-color))`);
        density--;
    }
    return stars.join(', ');
}
const config = {
    theme: {
        extend: {
            keyframes: {
                sparkle: {
                    '0%': { opacity: 0 },
                    '50%': { opacity: 1 },
                    '100%': { opacity: 0 },
                }
            },
            animation: {
                sparkle: 'sparkle 1s linear infinite alternate'
            },
            shadow: {
                'stars-1': generateRandomStars(0.4, 100),
                'stars-2': generateRandomStars(0.5, 100),
                'stars-3': generateRandomStars(0.2, 100),
                'stars-4': generateRandomStars(0.8, 100),
                'stars-5': generateRandomStars(0.1, 100)
            }    
        },
    },
} satisfies Config;

export default config;
