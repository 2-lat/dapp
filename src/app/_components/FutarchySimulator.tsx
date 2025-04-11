"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent } from "@/components/ui/card";

export function FutarchySimulator() {
  const [stakeA, setStakeA] = useState(50000);
  const [stakeB, setStakeB] = useState(50000);
  const [priceC, setPriceC] = useState(0.5);
  const [priceD, setPriceD] = useState(1.0);
  const [feePercent, setFeePercent] = useState(5);
  const [success, setSuccess] = useState(true);
  const [factTokenPrice, setFactTokenPrice] = useState(1.0);

  const totalPool = stakeA + stakeB;
  const fee = (feePercent / 100) * totalPool;
  const priceDiff = Math.abs(priceD - priceC);
  const projectCutPercent = Math.min(priceDiff * 100, 20); // Cap at 20% to prevent excessive cuts
  const projectCut = (projectCutPercent / 100) * totalPool;
  const distributablePool = totalPool - fee - projectCut;
  const netStakeA = stakeA - (stakeA / totalPool) * (fee + projectCut);
  const netStakeB = stakeB - (stakeB / totalPool) * (fee + projectCut);

  let tokensAllocated = 0;
  let payoutA = 0;
  let payoutB = 0;
  let directInvestmentInterest = 0;
  let roiA = 0;
  let roiB = 0;

  if (success) {
    // In success case, fact token price should be equal to target price
    // setFactTokenPrice(priceD);
    tokensAllocated = projectCut / priceC;
    directInvestmentInterest = stakeA * (priceD / priceC) - stakeA;
    const tokenValue = tokensAllocated * priceD;
    payoutA = netStakeA + netStakeB + tokenValue;
    payoutB = 0;
    roiA = ((payoutA - stakeA) / stakeA) * 100;
    roiB = -100; // Complete loss for B in success case
  } else {
    // In failure case, fact token price should be at most 50% of initial price
    // const maxFailurePrice = priceC * 0.5;
    // if (factTokenPrice > maxFailurePrice) {
    //   setFactTokenPrice(maxFailurePrice);
    // }
    tokensAllocated = projectCut / priceC;
    const tokenValue = tokensAllocated * priceD;
    payoutA = 0;
    payoutB = netStakeB + netStakeA + tokenValue;
    directInvestmentInterest = 0;
    roiA = -100; // Complete loss for A in failure case
    roiB = ((payoutB - stakeB) / stakeB) * 100;
  }

  return (
    <div className="grid grid-cols-2 gap-6 p-4">
      <div className="flex flex-col gap-4">
        <ToggleGroup
          type="single"
          value={success ? "success" : "failure"}
          onValueChange={(val) => setSuccess(val === "success")}
        >
          <ToggleGroupItem value="success">Success</ToggleGroupItem>
          <ToggleGroupItem value="failure">Failure</ToggleGroupItem>
        </ToggleGroup>
        <div className="flex flex-col gap-2">
          <p>Stake A: ${stakeA.toFixed(2)}</p>
          <Slider
            min={0}
            max={100000}
            step={1000}
            value={[stakeA]}
            onValueChange={([value]) =>
              typeof value === "number" && setStakeA(value)
            }
          />
        </div>
        <div className="flex flex-col gap-2">
          <p>Stake B: ${stakeB.toFixed(2)}</p>
          <Slider
            min={0}
            max={100000}
            step={1000}
            value={[stakeB]}
            onValueChange={([value]) =>
              typeof value === "number" && setStakeB(value)
            }
          />
        </div>
        <div className="flex flex-col gap-2">
          <p>Token Price C: ${priceC.toFixed(2)}</p>
          <Slider
            min={0.1}
            max={2.0}
            step={0.1}
            value={[priceC]}
            onValueChange={([value]) =>
              typeof value === "number" && setPriceC(value)
            }
          />
        </div>
        <div className="flex flex-col gap-2">
          <p>Target Price D: ${priceD.toFixed(2)}</p>
          <Slider
            min={priceC}
            max={priceC * 5}
            step={0.1}
            value={[priceD]}
            onValueChange={([value]) =>
              typeof value === "number" && setPriceD(value)
            }
          />
        </div>
        <div className="flex flex-col gap-2">
          <p>Fee: {feePercent}%</p>
          <Slider
            min={0}
            max={20}
            step={0.5}
            value={[feePercent]}
            onValueChange={([value]) =>
              typeof value === "number" && setFeePercent(value)
            }
          />
        </div>
        <div className="flex flex-col gap-2">
          <p>Fact Token Price: ${factTokenPrice.toFixed(2)}</p>
          <Slider
            min={0.1}
            max={priceD}
            step={0.1}
            value={[factTokenPrice]}
            onValueChange={([value]) =>
              typeof value === "number" && setFactTokenPrice(value)
            }
            disabled={success} // Disable in success case as it's fixed to target price
          />
        </div>
      </div>

      <Card>
        <CardContent className="space-y-2 p-4">
          <p>
            <strong>Outcome:</strong>{" "}
            {success ? "✅ Goal Achieved" : "❌ Goal Not Achieved"}
          </p>
          <p>
            <strong>Gross Stake A:</strong> ${stakeA.toFixed(2)}
          </p>
          <p>
            <strong>Gross Stake B:</strong> ${stakeB.toFixed(2)}
          </p>
          <p>
            <strong>Total Pool:</strong> ${totalPool.toFixed(2)}
          </p>
          <p>
            <strong>Net Stake A:</strong> ${netStakeA.toFixed(2)}
          </p>
          <p>
            <strong>Net Stake B:</strong> ${netStakeB.toFixed(2)}
          </p>
          <p>
            <strong>Platform Fee:</strong> ${fee.toFixed(2)} ({feePercent}%)
          </p>
          <p>
            <strong>Project Cut:</strong> ${projectCut.toFixed(2)} (
            {projectCutPercent.toFixed(1)}%)
          </p>
          <p>
            <strong>Distributable Pool:</strong> ${distributablePool.toFixed(2)}
          </p>
          <p>
            <strong>Fact Token Price:</strong> ${factTokenPrice.toFixed(2)}
          </p>
          <p>
            <strong>Tokens Allocated:</strong> {tokensAllocated.toFixed(0)}
          </p>
          <p>
            <strong>Token Value:</strong> $
            {(tokensAllocated * factTokenPrice).toFixed(2)}
          </p>
          <p>
            <strong>Payout to A:</strong> ${payoutA.toFixed(2)} (
            {tokensAllocated.toFixed(0)} tokens @ ${priceC})
          </p>
          <p>
            <strong>Payout to B:</strong> ${payoutB.toFixed(2)}
          </p>
          <p>
            <strong>Direct Investment Interest:</strong> $
            {directInvestmentInterest.toFixed(2)}
          </p>
          <p>
            <strong>ROI A:</strong> {roiA.toFixed(1)}%
          </p>
          <p>
            <strong>ROI B:</strong> {roiB.toFixed(1)}%
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
