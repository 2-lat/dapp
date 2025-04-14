import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

export async function getSigners(): Promise<{
  owner: SignerWithAddress;
  user1: SignerWithAddress;
  user2: SignerWithAddress;
}> {
  const [owner, user1, user2] = await ethers.getSigners();
  return { owner, user1, user2 };
}

export async function advanceTime(days: number) {
  await ethers.provider.send("evm_increaseTime", [days * 24 * 60 * 60]);
  await ethers.provider.send("evm_mine", []);
}

export async function getCurrentTimestamp() {
  const block = await ethers.provider.getBlock("latest");
  return block?.timestamp || 0;
}

export const CYCLE_DURATION = 29.5 * 24 * 60 * 60; // 29.5 days in seconds
export const LOCK_FRACTION = 90; // 90%
export const TREASURY_FRACTION = 10; // 10%
export const LOCK_CYCLES = 3;
export const MOON_PER_PAYMENT = 100; 