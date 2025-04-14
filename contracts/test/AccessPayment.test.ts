import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { AccessPayment } from "../typechain-types";
import { TwoLatToken } from "../typechain-types";
import { MoonToken } from "../typechain-types";
import { getSigners, advanceTime, CYCLE_DURATION } from "./helpers";
import { ZeroAddress } from "ethers";

describe("AccessPayment", function () {
  let accessPayment: AccessPayment;
  let twoLatToken: TwoLatToken;
  let moonToken: MoonToken;
  let owner: any;
  let user1: any;
  let user2: any;

  const INITIAL_ACCESS_PRICE = ethers.parseEther("1000");

  beforeEach(async function () {
    const signers = await getSigners();
    owner = signers.owner;
    user1 = signers.user1;
    user2 = signers.user2;

    // Deploy tokens
    const TwoLatToken = await ethers.getContractFactory("TwoLatToken");
    twoLatToken = await TwoLatToken.deploy();

    const MoonToken = await ethers.getContractFactory("MoonToken");
    moonToken = await MoonToken.deploy();

    // Deploy AccessPayment
    const AccessPayment = await ethers.getContractFactory("AccessPayment");
    accessPayment = await upgrades.deployProxy(
      AccessPayment,
      [
        await twoLatToken.getAddress(),
        await moonToken.getAddress(),
        owner.address, // treasury
        owner.address, // lockManager
        INITIAL_ACCESS_PRICE,
      ],
      { constructorArgs: [ZeroAddress] },
    );
    // Transfer some 2LAT to users
    await twoLatToken.transfer(user1.address, ethers.parseEther("10000"));
    await twoLatToken.transfer(user2.address, ethers.parseEther("10000"));
  });

  describe("Deployment", function () {
    it("Should set the correct initial values", async function () {
      expect(await accessPayment.twoLatToken()).to.equal(
        await twoLatToken.getAddress(),
      );
      expect(await accessPayment.moonToken()).to.equal(
        await moonToken.getAddress(),
      );
      expect(await accessPayment.treasury()).to.equal(owner.address);
      expect(await accessPayment.lockManager()).to.equal(owner.address);
      expect(await accessPayment.accessPrice()).to.equal(INITIAL_ACCESS_PRICE);
      expect(await accessPayment.owner()).to.equal(owner.address);
    });

    it("Should set the correct cycle duration", async function () {
      expect(await accessPayment.CYCLE_DURATION()).to.equal(CYCLE_DURATION);
    });
  });

  describe("Cycle Management", function () {
    it("Should correctly track current cycle", async function () {
      const startTime = await ethers.provider.getBlock("latest");
      expect(await accessPayment.getCurrentCycle()).to.equal(0);

      await advanceTime(30); // Advance 30 days
      expect(await accessPayment.getCurrentCycle()).to.equal(1);
    });

    it("Should correctly identify active cycle", async function () {
      expect(await accessPayment.isCycleActive()).to.be.true;

      await advanceTime(30); // Advance 30 days
      expect(await accessPayment.isCycleActive()).to.be.false;
    });
  });

  describe("Access Price Management", function () {
    it("Should allow owner to update access price", async function () {
      const newPrice = ethers.parseEther("2000");
      await accessPayment.setAccessPrice(newPrice);
      expect(await accessPayment.accessPrice()).to.equal(newPrice);
    });

    it("Should prevent non-owner from updating access price", async function () {
      const newPrice = ethers.parseEther("2000");
      await expect(
        accessPayment.connect(user1).setAccessPrice(newPrice),
      ).to.be.revertedWithCustomError(
        accessPayment,
        "OwnableUnauthorizedAccount",
      );
    });
  });

  // More test cases will be added as we implement the core functions
  // - payAccess
  // - payAccessWithPermit
  // - notifyTreasury
  // - createLock
  // - issueMoon
});
