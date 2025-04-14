import { expect } from "chai";
import { ethers } from "hardhat";
import { MoonToken } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("MoonToken", function () {
  let token: MoonToken;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    const Token = await ethers.getContractFactory("MoonToken");
    token = await Token.deploy();
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await token.name()).to.equal("MOON");
      expect(await token.symbol()).to.equal("MOON");
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
        token.connect(user1).mint(user2.address, mintAmount)
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

    it("Should allow owner to burn tokens", async function () {
      await token.burn(user1.address, burnAmount);
      expect(await token.balanceOf(user1.address)).to.equal(0);
    });

    it("Should prevent non-owner from burning tokens", async function () {
      await expect(
        token.connect(user1).burn(user1.address, burnAmount)
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });

    it("Should emit Transfer event on burn", async function () {
      await expect(token.burn(user1.address, burnAmount))
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
        token.connect(user1).transfer(user2.address, transferAmount)
      ).to.be.revertedWith("MOON: token is non-transferable");
    });

    it("Should prevent transferFrom", async function () {
      await expect(
        token.connect(user1).transferFrom(user1.address, user2.address, transferAmount)
      ).to.be.revertedWith("MOON: token is non-transferable");
    });
  });
}); 