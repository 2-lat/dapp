import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { Router } from "../typechain-types";
import { TwoLatToken } from "../typechain-types";
import { getSigners } from "./helpers";
import { ZeroAddress } from "ethers";

describe("Router", function () {
  let router: Router;
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

    // Deploy Router
    const Router = await ethers.getContractFactory("Router");
    router = await upgrades.deployProxy(
      Router,
      [
        await twoLatToken.getAddress(),
        owner.address, // accessPayment
        owner.address, // uniswapRouter
        owner.address, // weth
      ],
      { constructorArgs: [ZeroAddress] },
    );
  });

  describe("Deployment", function () {
    it("Should set the correct initial values", async function () {
      expect(await router.twoLatToken()).to.equal(
        await twoLatToken.getAddress(),
      );
      expect(await router.accessPayment()).to.equal(owner.address);
      expect(await router.uniswapRouter()).to.equal(owner.address);
      expect(await router.weth()).to.equal(owner.address);
    });
  });

  describe("Access Payment Management", function () {
    it("Should allow owner to update access payment address", async function () {
      await router.setAccessPayment(user1.address);
      expect(await router.accessPayment()).to.equal(user1.address);
    });

    it("Should prevent non-owner from updating access payment address", async function () {
      await expect(
        router.connect(user1).setAccessPayment(user1.address),
      ).to.be.revertedWithCustomError(router, "OwnableUnauthorizedAccount");
    });
  });

  describe("Uniswap Router Management", function () {
    it("Should allow owner to update Uniswap router address", async function () {
      await router.setUniswapRouter(user1.address);
      expect(await router.uniswapRouter()).to.equal(user1.address);
    });

    it("Should prevent non-owner from updating Uniswap router address", async function () {
      await expect(
        router.connect(user1).setUniswapRouter(user1.address),
      ).to.be.revertedWithCustomError(router, "OwnableUnauthorizedAccount");
    });
  });

  // More test cases will be added as we implement the core functions
  // - swapAndPay
  // - swapAndPayWithPermit
  // - estimateSwapAmount
});
