import { expect } from "chai";
import { ethers } from "hardhat";
import { TwoLatToken } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("TwoLatToken", function () {
  let token: TwoLatToken;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;

  const TOTAL_SUPPLY = ethers.parseEther("1000000000"); // 1 billion tokens

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    const Token = await ethers.getContractFactory("TwoLatToken");
    token = await Token.deploy();
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await token.name()).to.equal("2LAT");
      expect(await token.symbol()).to.equal("2LAT");
    });

    it("Should mint total supply to deployer", async function () {
      expect(await token.balanceOf(owner.address)).to.equal(TOTAL_SUPPLY);
    });

    it("Should have correct decimals", async function () {
      expect(await token.decimals()).to.equal(18);
    });
  });

  describe("Transfers", function () {
    const transferAmount = ethers.parseEther("1000");

    beforeEach(async function () {
      await token.transfer(user1.address, transferAmount);
    });

    it("Should transfer tokens between accounts", async function () {
      expect(await token.balanceOf(user1.address)).to.equal(transferAmount);
      expect(await token.balanceOf(owner.address)).to.equal(TOTAL_SUPPLY - transferAmount);
    });

    it("Should prevent transfer to zero address", async function () {
      await expect(
        token.transfer(ethers.ZeroAddress, transferAmount)
      ).to.be.revertedWithCustomError(token, "ERC20InvalidReceiver");
    });

    it("Should emit Transfer event", async function () {
      await expect(token.transfer(user2.address, transferAmount))
        .to.emit(token, "Transfer")
        .withArgs(owner.address, user2.address, transferAmount);
    });
  });

  describe("Allowance", function () {
    const approveAmount = ethers.parseEther("1000");

    it("Should approve tokens for delegated transfer", async function () {
      await token.approve(user1.address, approveAmount);
      expect(await token.allowance(owner.address, user1.address)).to.equal(approveAmount);
    });

    it("Should emit Approval event", async function () {
      await expect(token.approve(user1.address, approveAmount))
        .to.emit(token, "Approval")
        .withArgs(owner.address, user1.address, approveAmount);
    });
  });

  describe("TransferFrom", function () {
    const transferAmount = ethers.parseEther("1000");

    beforeEach(async function () {
      await token.approve(user1.address, transferAmount);
    });

    it("Should allow approved address to transfer tokens", async function () {
      await token.connect(user1).transferFrom(owner.address, user2.address, transferAmount);
      expect(await token.balanceOf(user2.address)).to.equal(transferAmount);
      expect(await token.allowance(owner.address, user1.address)).to.equal(0);
    });

    it("Should prevent transfer without approval", async function () {
      await expect(
        token.connect(user2).transferFrom(owner.address, user2.address, transferAmount)
      ).to.be.revertedWithCustomError(token, "ERC20InsufficientAllowance");
    });
  });
}); 