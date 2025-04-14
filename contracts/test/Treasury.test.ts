import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { Treasury } from "../typechain-types";
import { TwoLatToken } from "../typechain-types";
import { getSigners } from "./helpers";

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
    twoLatToken = await TwoLatToken.deploy();

    // Deploy Treasury
    const Treasury = await ethers.getContractFactory("Treasury");
    treasury = await upgrades.deployProxy(Treasury, [
      await twoLatToken.getAddress(),
      owner.address // accessPayment
    ]);

    // Transfer some 2LAT to users
    await twoLatToken.transfer(user1.address, ethers.parseEther("10000"));
    await twoLatToken.transfer(user2.address, ethers.parseEther("10000"));
  });

  describe("Deployment", function () {
    it("Should set the correct initial values", async function () {
      expect(await treasury.twoLatToken()).to.equal(await twoLatToken.getAddress());
      expect(await treasury.accessPayment()).to.equal(owner.address);
      expect(await treasury.totalFunds()).to.equal(0);
    });
  });

  describe("Access Payment Management", function () {
    it("Should allow owner to update access payment address", async function () {
      await treasury.setAccessPayment(user1.address);
      expect(await treasury.accessPayment()).to.equal(user1.address);
    });

    it("Should prevent non-owner from updating access payment address", async function () {
      await expect(
        treasury.connect(user1).setAccessPayment(user1.address)
      ).to.be.revertedWithCustomError(treasury, "OwnableUnauthorizedAccount");
    });
  });

  describe("Cycle Funds", function () {
    it("Should correctly track cycle funds", async function () {
      const cycle = 1;
      const amount = ethers.parseEther("1000");
      
      // Simulate receiving funds
      await twoLatToken.transfer(await treasury.getAddress(), amount);
      await treasury.getCycleFunds(cycle);
      
      expect(await treasury.getCycleFunds(cycle)).to.equal(0); // Will be updated when we implement receiveFunds
    });
  });

  // More test cases will be added as we implement the core functions
  // - receiveFunds
  // - distributeFunds
  // - calculateQuadraticFunding
}); 