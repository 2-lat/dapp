import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { Treasury, TreasuryV2Mock } from "../typechain-types";
import { TwoLatToken } from "../typechain-types";
import { getSigners } from "./helpers";
import { parseEther, ZeroAddress } from "ethers";
import { treasuryV2MockSol } from "../typechain-types/contracts/mock";

describe("Treasury", function () {
  let treasury: Treasury;
  let twoLatToken: TwoLatToken;
  let owner: any;
  let user1: any;
  let user2: any;

  beforeEach(async function () {
    const signers = await getSigners();
    owner = signers.owner;
    user1 = signers.user1;
    user2 = signers.user2;

    // Deploy 2LAT token
    const TwoLatToken = await ethers.getContractFactory("TwoLatToken");
    twoLatToken = await TwoLatToken.deploy(ZeroAddress);

    // Deploy Treasury
    const Treasury = await ethers.getContractFactory("Treasury");
    treasury = await upgrades.deployProxy(
      Treasury,
      [await twoLatToken.getAddress()],
      { constructorArgs: [ZeroAddress] },
    );
  });

  it("Should accept funds", async function () {
    await twoLatToken.transfer(treasury.getAddress(), parseEther("1000"));
    expect(await twoLatToken.balanceOf(treasury.getAddress())).to.equal(
      parseEther("1000"),
    );
  });

  it("Should withdraw funds", async function () {
    await twoLatToken.transfer(treasury.getAddress(), parseEther("1000"));

    const TreasuryV2Mock = await ethers.getContractFactory("TreasuryV2Mock");
    const treasuryV2 = await upgrades.upgradeProxy(await treasury.getAddress(), TreasuryV2Mock, {
      constructorArgs: [ZeroAddress],
    })
    
    expect(await twoLatToken.balanceOf(treasury.getAddress())).to.equal(parseEther("1000"));
    await treasuryV2.withdraw();
    expect(await twoLatToken.balanceOf(treasury.getAddress())).to.equal(0);
  });
});
