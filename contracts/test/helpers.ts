import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { getCreate2Address, keccak256, toUtf8Bytes } from "ethers";

const defaultAbiCoder = ethers.AbiCoder.defaultAbiCoder();


const saltToHex = (salt: string) => {
  const hexSalt = salt.toLowerCase()
  return (hexSalt.indexOf("0x") === -1)
      ? keccak256(toUtf8Bytes(salt))
      : hexSalt
}

export const encodeParams = (...args: Parameters<typeof defaultAbiCoder.encode>) => {
  return defaultAbiCoder.encode(...args)
}

const buildBytecode = (
  constructorTypes: Parameters<typeof defaultAbiCoder.encode>[0],
  constructorArgs: Parameters<typeof defaultAbiCoder.encode>[1],
  contractBytecode: string,
) => {
  return `${contractBytecode}${encodeParams(constructorTypes, constructorArgs).slice(
      2,
  )}`
}

export function calculateCreate2(from: string, salt: string, bytecode: string, [constructorTypes, constructorArgs]: Parameters<typeof defaultAbiCoder.encode>) {
  bytecode = '0x' + bytecode.replace('0x', '')

  if(constructorArgs && bytecode.length === 66)
    throw new Error('You can\'t pass in constructor arguments, and byte code as hash!')

    // add constructor arguments manually, if present
    if(constructorArgs)
      bytecode = buildBytecode(constructorTypes, constructorArgs, bytecode)

  // dont hash it if its already a hash
  bytecode = (bytecode.length !== 66)
      ? keccak256(bytecode)
      : bytecode

  const saltHex = saltToHex(salt)

  return getCreate2Address(from, saltHex, bytecode)
}

export async function getSigners(): Promise<{
  owner: SignerWithAddress;
  user1: SignerWithAddress;
  user2: SignerWithAddress;
  rest: SignerWithAddress[];
}> {
  const [owner, user1, user2, ...rest] = await ethers.getSigners();
  return { owner, user1, user2, rest };
}

export async function advanceTime(days: number) {
  await time.increase(days * 24 * 60 * 60);
}

export async function getCurrentTimestamp() {
  return await time.latest();
}

export const CYCLE_DURATION_SECONDS = 29.5 * 24 * 60 * 60; // 29.5 days in seconds
export const LOCK_FRACTION = 90; // 90%
export const TREASURY_FRACTION = 10; // 10%
export const LOCK_CYCLES = 3;
export const MOON_PER_PAYMENT = 100; 