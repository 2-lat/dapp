import { Fragment } from "react";
import type { ComponentProps } from "react";
import Markdown from "./Markdown";
import { cn } from "@/lib/utils";

export const WhitepaperContent = ({
  className,
  ...props
}: Omit<ComponentProps<typeof Markdown>, "children"> & {
  className?: string;
}) => {
  return (
    <div className={cn("prose dark:prose-invert", className)}>
      <Markdown>
        {`
## Abstract

**Second Latitude** is a futarchy-based funding protocol for web3 tokenomics. Using prediction markets and community governance, it allocates capital to projects during periods of significant market uncertainty.

## Introduction

Fundraising in web3 is broken. Builders face a flood of uncertainty—investors hesitate without strong foundational signals, and capital often flows based on hype rather than substance.

**Second Latitude** offers a new model—one grounded in market-driven confidence. We combine prediction markets with community governance to fund builders not just on belief, but on collective conviction.

Our futarchy-based system allows investors to stake **for** or **against** a project’s success. Believers back projects with 2LAT tokens, while skeptics can “short” them—profiting if their predictions are correct.

## Token Architecture

Our platform operates with two distinct tokens:

### 2LAT Token

* Fairlaunched on Solana via a bonding curve (pump.fun).
* Total supply: 1,000,000,000 tokens (no additional issuance).
* Purpose: Facilitates cycle access payments and staking in prediction markets.


### MOON Token

* Non-transferable token issued upon cycle payment.
* Purpose: Enables voting on projects entering prediction markets.
* Lifecycle: Burns at cycle’s end if unused, ensuring scarcity.


## Moon Cycles and Access


* **Cycle Duration**: One moon cycle lasts 29.5 days.
* **Access Payment**:
    * Users pay a fixed amount $$ A $$ in 2LAT to join a cycle.
    * Breakdown:
        * **Locked Amount**: $$ L_i = \\frac{9}{10}A $$, locked for 3 cycles.
        * **Treasury Allocation**: $$ T_i = \\frac{1}{10}A $$, used for builder subsidies.
    * Reward: Users receive $$ M $$ MOON tokens per payment for governance voting.
* **Locking Mechanism**:
    * For cycle $$ i $$, the locked amount is $$ L_i = \\frac{9}{10}P $$.
    * Unlocks occur after 3 cycles: $$ L_{i-3} $$ becomes available.
    * Skipping a cycle burns all prior locked amounts.
    * **Benefit**: Long-term participants can reduce their effective cost by up to 90\\%.


## Project Selection via Governance


* Users nominate or vote for builders by allocating MOON tokens.
* Each builder $$ B_i $$ accumulates votes $$ m_{i,j} $$ from user $$ j $$.
* Builders reaching the threshold $$ V_i = \\sum_j m_{i,j} \\geq \\theta $$ become eligible to offer a prediction market for their token and receive Builder Subsidies, where $$ \\theta $$ is a constant throughout the cycle.


## Builder Subsidies

### Treasury and Subsidy Pool


* 10\\% of each cycle payment contributes to the treasury.
* The cumulative treasury across users forms the subsidy pool:
    $$
    \\mathcal{R} = \\sum_{i=1}^{N} T_i = \\sum_{i=1}^{N} \\frac{1}{10}A_i
    $$
* This pool is allocated to builders via quadratic funding.


### Quadratic Subsidy Distribution with Threshold
Builders receive subsidies based on the square of the sum of square roots of votes, encouraging broader support:
$$
\\begin{align*}
    Q_i =
    \\begin{cases}
        \\dfrac{\\left( \\sum_j \\sqrt{m_{i,j}} \\right)^2}
              {\\sum\\limits_{k \\in \\mathcal{E}} \\left( \\sum_j \\sqrt{m_{k,j}} \\right)^2} \\cdot \\mathcal{R}, & \\text{if } V_i \\geq \\theta \\\\
        0, & \\text{if } V_i < \\theta
    \\end{cases}
\\end{align*}
$$


* $$ Q_i $$: Subsidy allocated to builder $$ B_i $$.
* $$ \\mathcal{E} $$: Set of all eligible builders such that $$ B_k \\in \\mathcal{E} \\iff V_k \\geq \\theta $$.
* $$ m_{i,j} $$: MOON votes from user $$ j $$ to builder $$ B_i $$.
* $$ \\mathcal{R} $$: Total treasury reward pool from 10\\% of cycle access payments.


## Futarchy-Based Prediction Markets

Let the following variables define the prediction mechanics:


* $$ \\mathcal{S} $$: Total 2LAT staked on success.
* $$ \\mathcal{F} $$: Total 2LAT staked on failure.
* $$ \\mathcal{T} = \\mathcal{S} + \\mathcal{F} $$: Total prediction market pool.
* $$ \\phi = 0.05 \\times \\mathcal{T} $$: Protocol fee.
* $$ p_E $$: Price at which project tokens are entered on the prediction market (entering price).
* $$ p_S $$: Expected or predicted project token price (market price), with $$ P_S > p_E $$.
* $$ p_F $$: Token price in case of failure, with $$ p_F < p_S $$.
* $$ \\delta = \\min(p_S - p_E, 0.2) $$: Project reward multiplier cap.
* $$ \\mathcal{I} = \\delta \\times \\mathcal{T} $$: Project’s immediate funding in 2LAT (project cut).
* $$ \\mathcal{D} = \\mathcal{T} - \\phi - \\mathcal{I} $$: Distributable pool for predictors.


### Project Funding


* The project receives $$ \\mathcal{I} $$ in 2LAT for development.
* Protocol uses $$ \\mathcal{I} $$ to buy project tokens at price $$ p_E $$ and distributes them to correct predictors.


### Payouts

* If success:
    * Total payout to success predictors:
    $$
    x = \\mathcal{D} + \\left( \\frac{\\mathcal{I}}{p_E} \\cdot p_S \\right)
    $$
    * Payout per user $$ i $$ with stake $$ s_i $$: 
    $$
    x_i = \\left( \\frac{s_i}{\\mathcal{S}} \\right) \\left[ \\mathcal{D} + \\left( \\frac{\\mathcal{I}}{p_C} \\cdot p_D \\right) \\right]
    $$
* If failure:
    * Total payout to failure predictors:
    $$
    x = \\mathcal{D} + \\left( \\frac{\\mathcal{I}}{p_E} \\cdot p_F \\right) \\\\
    $$
    * Payout per user $$ i $$ with stake $$ f_i $$:
    $$
    x_i = \\left( \\frac{f_i}{\\mathcal{F}} \\right) \\left[ \\mathcal{D} + \\left( \\frac{\\mathcal{I}}{p_C} \\cdot p_F \\right) \\right]
    $$

This design rewards correct predictions with upside exposure and ensures projects receive meaningful capital.

## Builder Rewards
* **Direct Funding**: Projects receive $$ \\mathcal{I} $$ in 2LAT.
* **Token Incentives**: Tokens issued to the protocol are redistributed to correct predictors.
* **Community Boost**: MOON vote counts signal trust and drive visibility.


## Cycle Summary
1. **Join**: Pay $$ A $$ in 2LAT (90\\% locked, 10\\% to treasury), receive $$ M $$ MOON.
1. **Vote**: Use MOON to select projects.
1. **Stake**: Place 2LAT on project success ($$ \\mathcal{S} $$) or failure ($$ \\mathcal{F} $$).
1. **Resolve**: Winners split $$ \\mathcal{D} $$ and project tokens; project receives $$ \\mathcal{R} $$.
1. **Reset**: MOON burns if unused; new cycle begins.

## Conclusion

**Second Latitude** combines the rhythmic trust of 2.lat with futarchy’s market-driven precision, creating a funding engine for builders who deliver and investors who discern value. We’re raising 2LAT now to fuel this vision—join us to lead the future of web3 funding.
`}
      </Markdown>
    </div>
  );
};
