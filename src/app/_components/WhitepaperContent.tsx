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
## Table of Contents
- [Abstract](#abstract)
- [Introduction](#introduction)
- [Tokens](#tokens)
  - [2LAT Token](#2lat-token)
  - [MOON Token](#moon-token)
- [Protocol Setup](#protocol-setup)
- [Moon Cycles and Access](#moon-cycles-and-access)
- [Governance and Parameter Voting](#governance-and-parameter-voting)
- [Project Selection via Governance](#project-selection-via-governance)
- [Builder Subsidies](#builder-subsidies)
  - [Treasury and Subsidy Pool](#treasury-and-subsidy-pool)
  - [Quadratic Subsidy Distribution with Threshold](#quadratic-subsidy-distribution-with-threshold)
- [Futarchy-Based Prediction Markets](#futarchy-based-prediction-markets)
  - [Project Funding](#project-funding)
  - [Payouts](#payouts)
- [Builder Rewards](#builder-rewards)
- [Cycle Summary](#cycle-summary)
- [Conclusion](#conclusion)
- [Appendix: Initial Protocol Parameters](#appendix-initial-protocol-parameters)
- [Appendix: Prediction Execution and Cross-Chain Asset Integration](#appendix-prediction-execution-and-cross-chain-asset-integration)
  - [Prediction Execution Mechanisms](#prediction-execution-mechanisms)

## Abstract

> after the rush  
> a circle forms  
> you stand

Second Latitude is a futarchy-based funding protocol for those who don’t chase hype, but build — quietly, consistently, and deliberately.

It is a decentralized mechanism that filters noise by requiring participants to vote for projects and spend voting power to be heard, seen, and funded.

Projects that earn sufficient support can offer their tokens at a discount via prediction-based OTC markets. This creates a direct path from belief to backing.

## Introduction

Fundraising is overloaded with noise, inflated metrics, and misaligned incentives. Builders are pushed to be loud, not build value. Funding flows toward visibility, not value.

*Second Latitude introduces a structural correction.* It is a decentralized funding mechanism that filters noise through cost and commitment. Participants must pay to enter each funding cycle using the 2LAT token. In return, they receive MOON tokens—limited voting power used to support selected projects, nominate projects, and publish project updates.

To be heard, users must spend influence. To be funded, builders must gather distributed, verifiable support.

Each vote allocates a portion of the shared treasury, sourced from access payments. Projects that meet the minimum threshold become eligible for subsidies. Funding is distributed via quadratic weighting, ensuring that broad support matters more than concentrated stake.

This creates a dynamic where capital flows to builders who demonstrate acceptance.

Prediction markets extend this alignment. Participants can stake 2LAT on the success or failure of approved projects. Those who predict correctly are rewarded from the pool. The protocol prices belief — and returns value where conviction proves accurate.

By combining cyclical access, costly signal, and futarchy-based resolution, Second Latitude funds what survives attention — and what stands beyond it.

## Tokens

Our protocol operates with two distinct tokens:

### 2LAT Token

- Fairlaunched on Base via a bonding curve.
- Total supply: 1,000,000,000 tokens (no additional issuance).
- Purpose: Facilitates cycle access payments and staking in prediction markets.

### MOON Token

- Non-transferable token issued upon cycle payment.
- Burns at cycle’s end if unused.
- Purpose: Governance token used to nominate builders, allocate treasury subsidies, publish project updates, and vote on prediction market entry.

## Protocol Setup

The Second Latitude protocol is governed by a set of parameters that define its operation. These parameters are summarized below and referenced throughout the document. Initial values are provided in [Appendix: Initial Protocol Parameters](#appendix-initial-protocol-parameters).

- $$\\phi_A$$: Price of participation of the next cycle.
- $$\\phi_T$$: Fraction of access payment $$\\phi_A$$ allocated to the treasury, where $$\\phi_T \\in \\mathbb{R}, 0 < \\phi_T \\leq 1$$.
- $$\\phi_L$$: Fraction of access payment $$\\phi_A$$ that is locked for each cycle, where $$\\phi_L = 1 - \\phi_T$$.
- $$\\phi_C$$: Number of cycles for which the locked amount is held, where $$\\phi_C \\in \\mathbb{N}, \\phi_C > 0$$.
- $$\\phi_F$$: Fraction of the prediction market pool deducted as a protocol fee.
- $$\\phi_D$$: Maximum value for the project cut multiplier $$\\Delta$$.
- $$\\phi_V$$: Voting threshold required for builder eligibility.
- $$\\phi_M$$: The amount of MOON votes received at the beginning of the cycle.
- $$\\phi_N$$: The amount of MOON votes required to nominate project.
- $$\\phi_U$$: The amount of MOON votes required to publish project update (to collect votes).

These parameters may be adjusted for future cycles based on governance decisions, as described in [Governance and Parameter Voting](#governance-and-parameter-voting).

## Moon Cycles and Access

- **Cycle Duration**: One moon cycle lasts 29.5 days (2,548,800 seconds).
- **Access Payment**:
  - User $$i$$ pays a fixed amount $$\\phi_A$$ in 2LAT to join the next cycle, where $$A_i$$ is user $$i$$ payment.
  - Breakdown:
    - **Locked Amount**: $$L_i = \\phi_L \\times A_i$$, locked for $$\\phi_C$$ cycles.
    - **Treasury Allocation**: $$T_i = \\phi_T \\times A_i$$, used for builders subsidies.
  - Reward: Users receive $$\\phi_M$$ MOON tokens per payment for governance voting.
- **Locking Mechanism**:
  - For cycle $$i$$, the locked amount is $$L_i = \\phi_L \\times \\phi_A$$.
  - Unlocks occur after $$\\phi_C$$ cycles: $$L_{i-\\phi_C}$$ becomes available.
  - **Skipping a cycle burns all prior locked amounts.**
  - **Benefit**: Long-term participants can reduce their effective cost by up to 90%.

## Governance and Parameter Voting

Before the end of each moon cycle, MOON token holders may vote to adjust protocol parameters for the next cycle. This process ensures the protocol remains adaptive to community needs and market conditions. The adjustable parameters include:

- $$\\phi_A$$: Price of participation of the next cycle.
- $$\\phi_F$$: Protocol fee fraction.
- $$\\phi_D$$: Project cut multiplier cap.
- $$\\phi_T$$: Fraction of access payment allocated to the treasury.
- $$\\phi_M$$: The amount of MOON votes received at the beginning of the cycle.
- $$\\phi_N$$: The amount of MOON votes required to nominate project.
- $$\\phi_U$$: The amount of MOON votes required to publish project update (to collect votes).
- $$\\phi_V$$: Voting threshold required for builder eligibility.

Voting is conducted using MOON tokens, with each token representing one vote.

## Project Selection via Governance

The governance process enables users to nominate and vote for builders, while builders share updates to demonstrate progress. Using MOON tokens, participants collectively determine which projects qualify for builder subsidies and prediction markets, as detailed below.

- Users nominate projects by burning $$\\phi_N$$ MOON tokens. Nominations do not contribute to voting totals but allow projects to participate on the protocol. Users may vote for each nomination by casting one MOON token, with a limit of one vote per user per nomination.
- Projects share updates by burning $$\\phi_U$$ MOON tokens per update. Users may vote for each update by casting one MOON token, with a limit of one vote per user per update.
- For each builder $$B_i$$, the votes $$m_{i,j}$$ from user $$j$$ may include one vote for the nomination (if cast) and one vote for each update the user supports.
- The total votes for builder $$B_i$$ are computed as $$V_i = \\sum_j m_{i,j}$$. Builders with $$V_i \\geq \\phi_V$$ become eligible to receive builder subsidies ([Builder Subsidies](#builder-subsidies)) and offer a prediction market for their token ([Futarchy-Based Prediction Markets](#futarchy-based-prediction-markets)).

## Builder Subsidies

### Treasury and Subsidy Pool

- $$\\phi_T$$ of each cycle payment contributes to the treasury $$T$$.
- The cumulative treasury across users forms the subsidy pool:
  $$
  \\mathcal{R} = \\sum_{i=1}^{N} T_i = \\sum_{i=1}^{N} \\phi_T A_i
  $$
- This pool is allocated to builders via quadratic funding.

### Quadratic Subsidy Distribution with Threshold

At the end of the cycle, builders receive subsidies based on the square of the sum of square roots of votes, encouraging broad support across nominations and updates:

$$
Q_i =
\\begin{cases}
\\dfrac{\\left( \\sum_j \\sqrt{m_{i,j}} \\right)^2}
      {\\sum_{k \\in \\mathcal{E}} \\left( \\sum_j \\sqrt{m_{k,j}} \\right)^2} \\cdot \\mathcal{R}, & \\text{if } V_i \\geq \\phi_V \\\\
0, & \\text{otherwise}
\\end{cases}
$$

- $$Q_i$$: Subsidy allocated to builder $$B_i$$.
- $$\\mathcal{E}$$: Set of all eligible builders such that $$B_k \\in \\mathcal{E} \\iff V_k \\geq \\phi_V$$.
- $$m_{i,j}$$: Votes from user $$j$$ to builder $$B_i$$, including one nomination vote and one vote per supported update.
- $$\\mathcal{R}$$: Total treasury reward pool from $$\\phi_T$$ of cycle access payments.

## Futarchy-Based Prediction Markets

Each eligible project may choose to offer a specified amount of their existing or future tokens for the prediction market, enabling a market-driven evaluation of their potential success.

To participate, the project must define several key parameters:

- The **prediction execution time** specifies when the success or failure of the project will be assessed.
- The **entry price** determines the cost at which the protocol acquires the project’s tokens for distribution to predictors.
- The **expected price** represents the target token price anticipated at the moment of execution, serving as the benchmark for the prediction’s outcome.
- The **maximum token amount** specifies the upper limit of tokens the project is willing to sell at the entry price.

Participants stake 2LAT tokens on whether this target will be achieved by the execution time, with payouts reflecting the resolution—providing projects with immediate funding while leveraging futarchy-based decision-making to align incentives.

Let the following variables define the prediction mechanics:

- $$\\mathcal{S}$$: Total 2LAT staked on success.
- $$\\mathcal{F}$$: Total 2LAT staked on failure.
- $$\\mathcal{T} = \\mathcal{S} + \\mathcal{F}$$: Total prediction market pool.
- $$\\Phi = \\phi_F \\times \\mathcal{T}$$: Protocol fee.
- $$p_E$$: Price at which project tokens are entered on the prediction market (entry price).
- $$p_S$$: Expected project token price at moment of prediction execution, where $$p_S > p_E$$.
- $$\\Delta = \\min\\left(\\frac{p_S - p_E}{p_E}, \\phi_D\\right)$$: Project reward multiplier cap.
- $$\\mathcal{I} = \\Delta \\mathcal{T}$$: Project’s immediate funding in 2LAT (project cut).
- $$\\mathcal{X} = \\frac{\\mathcal{I}}{p_E}$$: Number of project tokens purchased by the protocol.
- $$\\mathcal{D} = \\mathcal{T} - \\Phi - \\mathcal{I}$$: Distributable pool for predictors in 2LAT.

### Project Funding

- The project receives $$\\mathcal{I}$$ in 2LAT for development.
- The protocol uses $$\\mathcal{I}$$ to buy $$N_{\\text{tokens}}$$ project tokens at price $$p_E$$ for distribution to correct predictors.

### Payouts

#### If Success (token price at execution $$\\geq p_S$$)

- Success predictors receive:
  - **2LAT**: $$\\mathcal{D}$$ distributed proportionally to their stake.
  - **Project Tokens**: $$\\mathcal{X}$$ distributed proportionally to their stake.
- Payout per user $$i$$ with stake $$s_i$$:
  $$
  x_i = \\left( \\frac{s_i}{\\mathcal{S}} \\right) \\mathcal{D} \\text{ (in 2LAT)} + \\left( \\frac{s_i}{\\mathcal{S}} \\right) \\mathcal{X} \\text{ (in project tokens)}
  $$

#### If Failure (token price at execution $$< p_S$$)

- Failure predictors receive:
  - **2LAT**: $$\\mathcal{D}$$ distributed proportionally to their stake.
  - **Project Tokens**: $$\\mathcal{X}$$ distributed proportionally to their stake.
- Payout per user $$i$$ with stake $$f_i$$:
  $$
  x_i = \\left( \\frac{f_i}{\\mathcal{F}} \\right) \\mathcal{D} \\text{ (in 2LAT)} + \\left( \\frac{f_i}{\\mathcal{F}} \\right) \\mathcal{X} \\text{ (in project tokens)}
  $$

## Builder Rewards

- **Direct Funding**: Projects receive $$\\mathcal{I}$$ in 2LAT.
- **Subsidies**: Projects eligible for subsidies receive a portion of the treasury according to a quadratic distribution ([Builder Subsidies](#builder-subsidies)).
- **Visibility**: MOON vote counts signal trust and drive visibility.

## Cycle Summary

1. **Join**: Pay $$\\phi_A$$ in 2LAT ($$\\phi_L \\times \\phi_A$$ locked, $$\\phi_T \\times \\phi_A$$ to treasury), receive $$\\phi_M$$ MOON.
2. **Vote**: Burn MOON to nominate, support, and vote for projects.
3. **Stake**: Place 2LAT on project success ($$\\mathcal{S}$$) or failure ($$\\mathcal{F}$$).
4. **Reset**: MOON burns if unused; new cycle begins.

## Conclusion

*Second Latitude combines the rhythmic trust of 2.lat with futarchy’s market-driven precision, creating a funding engine for builders who deliver and investors who discern value. We’re raising 2LAT now to fuel this vision—join us to lead the future of web3 funding.*

## Appendix: Initial Protocol Parameters

The following table summarizes the initial values of the protocol's parameters as defined in the Second Latitude whitepaper.

| Symbol    | Description                                           | Initial Value |
|-----------|-------------------------------------------------------|---------------|
| $$\\phi_A$$ | Price of participation per cycle                     | 1000          |
| $$\\phi_L$$ | Fraction of access payment locked                    | 90%           |
| $$\\phi_T$$ | Fraction of access payment to treasury                | 10%           |
| $$\\phi_C$$ | Number of cycles for lock                            | 3             |
| $$\\phi_F$$ | Protocol fee fraction                                | 5%            |
| $$\\phi_D$$ | Project reward multiplier cap                        | 20%           |
| $$\\phi_V$$ | Voting threshold for builder eligibility             | 50            |
| $$\\phi_M$$ | The amount of MOON votes received at the beginning of the cycle | 100           |
| $$\\phi_N$$ | The amount of MOON votes required to nominate project | 50            |
| $$\\phi_U$$ | The amount of MOON votes required to publish project update | 10            |

**Table: Initial values of protocol parameters.**

## Appendix: Prediction Execution and Cross-Chain Asset Integration

This appendix outlines mechanisms to ensure the accurate execution of predictions in the Second Latitude protocol’s futarchy-based prediction markets, as described in [Futarchy-Based Prediction Markets](#futarchy-based-prediction-markets). It also details strategies for integrating cross-chain assets to enable participation of diverse token types and non-token outcomes, ensuring flexibility and robustness in the protocol’s funding ecosystem.

### Prediction Execution Mechanisms

The prediction market resolves based on whether a project’s token price at the execution time meets or exceeds the expected price. 
Accurate and transparent execution is critical to maintain trust and align incentives. The protocol employs tailored mechanisms depending on the asset type and prediction context, as follows:

- **Base Tokens** (Native to the Base blockchain):
  - **Escrow**: Tokens are held in on-chain escrow smart contracts deployed on Base. These contracts lock the project’s tokens ($$N_{\\text{tokens}}$$) at the entry price $$p_E$$ until the prediction execution time, ensuring availability for distribution to correct predictors.
  - **Price Exploration**: The token price at execution is determined using Uniswap V3 pools on Base. The protocol queries the time-weighted average price (TWAP) over a predefined interval (e.g., 1 hour) from the relevant Uniswap pool to mitigate manipulation risks and ensure a fair market price. If multiple pools exist, the protocol selects the pool with the highest liquidity to enhance reliability.
  - **Execution**: At the execution time, the smart contract compares the TWAP to $$p_S$$. If the TWAP $$\\geq p_S$$, success predictors receive their share of $$\\mathcal{D}$$ (in 2LAT) and $$N_{\\text{tokens}}$$ (in project tokens); otherwise, failure predictors receive the payouts, as detailed in [Futarchy-Based Prediction Markets](#futarchy-based-prediction-markets).

- **Foreign Tokens** (Tokens on other blockchains):
  - **Escrow**: Cross-chain escrow is facilitated using LayerZero and/or Chainlink Cross-Chain Interoperability Protocol (CCIP). The project locks tokens on their native chain in a compatible escrow contract. A cross-chain message (via LayerZero) or token transfer (via Chainlink CCIP) confirms the lock to the Base chain, ensuring the protocol can distribute equivalent token claims or bridged tokens to predictors.
  - **Price Oraclization**: The token price is obtained via Chainlink price feeds on the native chain (or CCIP workaround for assets without official price feeds), oraclized to Base. The protocol uses a decentralized oracle network to fetch the token’s market price (e.g., from a major decentralized exchange on the native chain) at execution time, adjusted for any cross-chain price discrepancies (e.g., bridging fees). To prevent flash-loan attacks, the price is averaged over a short window (e.g., 30 minutes).
  - **Execution**: The oraclized price is compared to $$p_S$$. Payouts are distributed as described in [Futarchy-Based Prediction Markets](#futarchy-based-prediction-markets), with tokens either bridged to Base for distribution or represented as claimable rights on the native chain, depending on the escrow setup.

- **Future Tokens** (Tokens not yet issued):
  - **Escrow**: Since future tokens do not exist at the time of the prediction market, the protocol leverages off-chain legal agreements to enforce obligations. Projects enter into a **Simple Agreement for Future Tokens (SAFT)** (or analogous agreements compliant with the project’s jurisdiction), specifying the commitment to issue $$N_{\\text{tokens}}$$ (up to $$N_{\\text{max}}$$) at $$p_E$$ upon token creation. The SAFT is countersigned by trusted escrow agents (e.g., legal firms or decentralized arbitration entities) to ensure enforceability.
  - **Price Exploration**: Upon token issuance, the price is determined using the same mechanism as Base tokens (Uniswap TWAP) if launched on Base, or oraclized prices if launched elsewhere. If the token is not issued by the execution time, the prediction market may resolve as a failure, or an alternative metric (e.g., project milestone completion) may be used, as specified in the SAFT.
  - **Execution**: At execution, the protocol verifies the token issuance and price. If issued, payouts follow [Futarchy-Based Prediction Markets](#futarchy-based-prediction-markets). If not issued, the escrow agents enforce penalties (e.g., forfeiture of collateral) to compensate predictors, with 2LAT payouts adjusted accordingly.

- **Non-Token Predictions** (Future Expansion):
  - **Framework**: For predictions not tied to token prices (e.g., project milestones, market adoption metrics), the protocol plans to integrate with Polymarket, a decentralized prediction market platform, to leverage its robust outcome resolution mechanisms.
  - **Escrow**: Funds (in 2LAT) are held in Base escrow contracts, with outcomes linked to Polymarket markets or oraclized external data. No project tokens are involved, as payouts are purely in 2LAT from $$\\mathcal{D}$$.
  - **Oraclization**: Chainlink oracles fetch outcome data (e.g., API results, verified milestone reports) or Polymarket resolution outcomes, ensuring decentralized and tamper-resistant resolution.
  - **Execution**: The oraclized outcome determines success or failure, with payouts distributed proportionally from $$\\mathcal{D}$$ to correct predictors. Non-token predictions simplify token distribution but require robust oracle design to maintain trust.
`}
      </Markdown>
    </div>
  );
};
