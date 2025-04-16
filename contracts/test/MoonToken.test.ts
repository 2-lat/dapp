import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { MinimalForwarder, MoonToken } from "../typechain-types";

describe("MoonToken", function () {
  let token: MoonToken;
  let forwarder: MinimalForwarder;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const Forwarder = await ethers.getContractFactory("MinimalForwarder");
    forwarder = await Forwarder.deploy();
    const forwarderAddress = await forwarder.getAddress();

    const MoonToken = await ethers.getContractFactory("MoonToken");
    token = await upgrades.deployProxy(MoonToken, [1, owner.address], {
      constructorArgs: [forwarderAddress],
    });
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await token.symbol()).to.equal("MOON1");
      expect(await token.name()).to.equal("Moon Cycle 1");
    });

    it("Should have correct decimals", async function () {
      expect(await token.decimals()).to.equal(1);
    });
  });

  describe("Minting", function () {
    const mintAmount = 100;

    it("Should allow owner to mint tokens", async function () {
      await token.mint(user1.address, mintAmount);
      expect(await token.balanceOf(user1.address)).to.equal(mintAmount);
    });

    it("Should prevent non-owner from minting tokens", async function () {
      await expect(
        token.connect(user1).mint(user2.address, mintAmount),
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });

    it("Should emit Transfer event on mint", async function () {
      await expect(token.mint(user1.address, mintAmount))
        .to.emit(token, "Transfer")
        .withArgs(ethers.ZeroAddress, user1.address, mintAmount);
    });
  });

  describe("Burning", function () {
    const burnAmount = 100;

    beforeEach(async function () {
      await token.mint(user1.address, burnAmount);
    });

    it("Should allow to burn tokens", async function () {
      await token.connect(user1).burn(burnAmount);
      expect(await token.balanceOf(user1.address)).to.equal(0);
    });

    it("Should emit Transfer event on burn", async function () {
      await expect(token.connect(user1).burn(burnAmount))
        .to.emit(token, "Transfer")
        .withArgs(user1.address, ethers.ZeroAddress, burnAmount);
    });
  });

  describe("Transfers", function () {
    const transferAmount = 100;

    beforeEach(async function () {
      await token.mint(user1.address, transferAmount);
    });

    it("Should prevent token transfers", async function () {
      await expect(
        token.connect(user1).transfer(user2.address, transferAmount),
      ).to.be.revertedWithCustomError(token, "NonTransferable");
    });

    it("Should prevent transferFrom", async function () {
      await token.connect(user2).approve(user1.address, transferAmount);
      await expect(
        token
          .connect(user1)
          .transferFrom(user2.address, user1.address, transferAmount),
      ).to.be.revertedWithCustomError(token, "NonTransferable");
    });
  });
});
