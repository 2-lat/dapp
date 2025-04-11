"use client";

import { useMounted } from "@/hooks/useMounted";
import { findNextNewMoon } from "@/utils/moon";
import { mockStats, mockWalletState } from "@/utils/mockData";
import { Button } from "@/components/ui/button";
import { ObserveMoon } from "./ObserveMoon";

export const ObservePage = () => {
  const isMounted = useMounted();
  const { isConnected, latBalance, hasMembership } = mockWalletState;
  const { latPrice, marketCap, lockedLat, nextMoonMembers } = mockStats;
  const nextMoon = isMounted ? findNextNewMoon() : new Date();

  return (
    <div className="relative min-h-screen">
      <div className="absolute top-0 z-10 w-full p-4">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 grid grid-cols-1 gap-4 rounded-lg bg-background/80 p-4 backdrop-blur sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center p-3">
              <div className="text-sm text-muted-foreground mb-1">Next Moon</div>
              <div className="font-mono text-base sm:text-lg">
                {isMounted ? nextMoon.toLocaleDateString() : "Loading..."}
              </div>
            </div>
            <div className="text-center p-3">
              <div className="text-sm text-muted-foreground mb-1">2LAT Price / MCap</div>
              <div className="font-mono text-base sm:text-lg">
                ${latPrice} / ${marketCap.toLocaleString()}
              </div>
            </div>
            <div className="text-center p-3">
              <div className="text-sm text-muted-foreground mb-1">Locked 2LAT</div>
              <div className="font-mono text-base sm:text-lg">
                {lockedLat.toLocaleString()}
              </div>
            </div>
            <div className="text-center p-3">
              <div className="text-sm text-muted-foreground mb-1">Next Moon Members</div>
              <div className="font-mono text-base sm:text-lg">
                {nextMoonMembers}
              </div>
            </div>
          </div>

          <div className="flex justify-center px-4">
            {!isConnected && (
              <Button variant="outline" className="w-full sm:w-auto">
                Connect Wallet
              </Button>
            )}
            {isConnected && !hasMembership && (
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <span className="font-mono text-base sm:text-lg">{latBalance} 2LAT</span>
                <Button className="w-full sm:w-auto">Buy Membership</Button>
              </div>
            )}
            {isConnected && hasMembership && (
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <span className="font-mono text-base sm:text-lg">{latBalance} 2LAT</span>
                <span className="text-sm text-muted-foreground">Membership Active</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <ObserveMoon />
    </div>
  );
}; 