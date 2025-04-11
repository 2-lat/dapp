"use client";

import { useMounted } from "@/hooks/useMounted";
import { findNextNewMoon } from "@/utils/moon";
import { mockStats, mockWalletState } from "@/utils/mockData";
import { Button } from "@/components/ui/button";
import { ObserveMoon } from "./ObserveMoon";
import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

export const ObservePage = () => {
  const isMounted = useMounted();
  const { isConnected, latBalance, hasMembership } = mockWalletState;
  const { latPrice, marketCap, lockedLat, nextMoonMembers } = mockStats;
  const nextMoon = isMounted ? findNextNewMoon() : new Date();

  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const moonOpacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const connectOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <div className="container mx-auto flex flex-col items-center justify-between gap-8" ref={containerRef}>
      {/* Stats Section */}
      <motion.div
        className="w-full max-w-4xl sticky top-40 bg-background/80 backdrop-blur-sm p-8"
        style={{ opacity: moonOpacity }}
      >
        <div className="grid grid-cols-2 gap-8 text-center text-sm sm:grid-cols-3 lg:grid-cols-5">
          <div>
            <div className="text-muted-foreground mb-1 text-xs tracking-wider uppercase">
              Next Moon
            </div>
            <div className="font-mono">
              {isMounted ? nextMoon.toLocaleDateString() : "Loading..."}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1 text-xs tracking-wider uppercase">
              2LAT Price
            </div>
            <div className="font-mono">${latPrice}</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1 text-xs tracking-wider uppercase">
              Market Cap
            </div>
            <div className="font-mono">${marketCap.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1 text-xs tracking-wider uppercase">
              Locked 2LAT
            </div>
            <div className="font-mono">{lockedLat.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1 text-xs tracking-wider uppercase">
              Subsidy Pool
            </div>
            <div className="font-mono">42,000 2LAT</div>
          </div>
        </div>
      </motion.div>
      {/* Moon Section */}
      <ObserveMoon className="sticky top-24 max-h-[50vh] w-full max-w-sm" />
      {/* CTA Section */}
      <motion.div
        className="bg-background/80 flex w-full max-w-xl flex-col items-center gap-8 p-8 text-center backdrop-blur-sm"
        style={{ opacity: connectOpacity }}
      >
        {!isConnected && (
          <>
            <div className="text-muted-foreground max-w-md text-lg">
              Connect your wallet to join the next moon cycle and become part of
              the community
            </div>
            <Button
              variant="default"
              size="lg"
              className={cn(
                "h-16 w-full min-w-64 text-lg sm:w-auto",
                "bg-background text-foreground border-foreground border-2",
                "hover:bg-foreground hover:text-background",
                "transition-colors duration-200",
                "shadow-foreground shadow-[4px_4px_0px_0px]",
                "hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none",
              )}
            >
              Connect Wallet
            </Button>
          </>
        )}
        {isConnected && !hasMembership && (
          <div className="flex w-full flex-col items-center gap-6">
            <div className="text-muted-foreground max-w-md text-lg">
              You have {latBalance} 2LAT available to join the next moon cycle
            </div>
            <Button
              className={cn(
                "h-16 w-full min-w-64 text-lg sm:w-auto",
                "bg-background text-foreground border-foreground border-2",
                "hover:bg-foreground hover:text-background",
                "transition-colors duration-200",
                "shadow-foreground shadow-[4px_4px_0px_0px]",
                "hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none",
              )}
            >
              Buy Membership
            </Button>
          </div>
        )}
        {isConnected && hasMembership && (
          <div className="flex w-full flex-col items-center gap-4">
            <span className="font-mono text-xl">{latBalance} 2LAT</span>
            <span className="text-muted-foreground text-lg">
              Membership Active
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
};
