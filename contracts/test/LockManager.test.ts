import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { LockManager } from "../typechain-types";
import { TwoLatToken } from "../typechain-types";
import { getSigners, advanceTime, CYCLE_DURATION } from "./helpers";

describe("LockManager", function () {
  let lockManager: LockManager;
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

    // Deploy LockManager
    const LockManager = await ethers.getContractFactory("LockManager");
    lockManager = await upgrades.deployProxy(LockManager, [
      await twoLatToken.getAddress(),
      owner.address // accessPayment
    ]);

    // Transfer some 2LAT to users
    await twoLatToken.transfer(user1.address, ethers.parseEther("10000"));
    await twoLatToken.transfer(user2.address, ethers.parseEther("10000"));
  });

  describe("Deployment", function () {
    it("Should set the correct initial values", async function () {
      expect(await lockManager.twoLatToken()).to.equal(await twoLatToken.getAddress());
      expect(await lockManager.accessPayment()).to.equal(owner.address);
    });

    it("Should set the correct cycle duration", async function () {
      expect(await lockManager.CYCLE_DURATION()).to.equal(CYCLE_DURATION);
    });
  });

  describe("Access Payment Management", function () {
    it("Should allow owner to update access payment address", async function () {
      await lockManager.setAccessPayment(user1.address);
      expect(await lockManager.accessPayment()).to.equal(user1.address);
    });

    it("Should prevent non-owner from updating access payment address", async function () {
      await expect(
        lockManager.connect(user1).setAccessPayment(user1.address)
      ).to.be.revertedWithCustomError(lockManager, "OwnableUnauthorizedAccount");
    });
  });

  describe("Lock Management", function () {
    it("Should correctly track user locks", async function () {
      const locks = await lockManager.getUserLocks(user1.address);
      expect(locks.length).to.equal(0);
    });

    it("Should correctly track cycle locks", async function () {
      const cycle = 1;
      const locks = await lockManager.getCycleLocks(cycle);
      expect(locks).to.equal(0);
    });
  });

  // More test cases will be added as we implement the core functions
  // - createLock
  // - claimLock
  // - getLockedAmount
}); 