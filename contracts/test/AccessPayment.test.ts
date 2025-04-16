import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { keccak256, MaxUint256, ZeroAddress } from "ethers";
import { ethers, upgrades } from "hardhat";
import {
  AccessPayment,
  MoonToken,
  MoonToken__factory,
  TwoLatToken
} from "../typechain-types";
import { calculateCreate2, encodeParams } from "./helpers";

describe("AccessPayment", function () {
  const CYCLE_DURATION = 2548800;
  let accessPayment: AccessPayment;
  let twoLatToken: TwoLatToken;
  let moonTokenImplementation: MoonToken;
  let startTimestamp: number;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let user3: SignerWithAddress;
  let treasury: SignerWithAddress;
  let lockManager: SignerWithAddress;

  const config = {
    lockCycles: 3,
    lockFraction: 900,
    treasuryFraction: 100,
    moonPerPayment: 100,
    accessPrice: 1000n * 10n ** 18n,
  };

  beforeEach(async function () {
    startTimestamp = (await time.latest()) + 60;
    [owner, user1, user2, treasury, lockManager, user3] =
      await ethers.getSigners();

    const TwoLatToken = await ethers.getContractFactory("TwoLatToken");
    twoLatToken = await TwoLatToken.deploy(ZeroAddress);

    const MoonToken = await ethers.getContractFactory("MoonToken");
    moonTokenImplementation = await MoonToken.deploy(ZeroAddress);

    const AccessPayment = await ethers.getContractFactory("AccessPayment");
    accessPayment = await upgrades.deployProxy(
      AccessPayment,

      // uint256 _startTimestamp,
      // address _twoLatToken,
      // address _treasury,
      // address _moonTokenImplementation,
      // ProtocolConfig calldata _protocolConfig
      [
        startTimestamp,
        await twoLatToken.getAddress(),
        treasury.address,
        await moonTokenImplementation.getAddress(),
        {
          lockCycles: 3,
          lockFraction: 900,
          treasuryFraction: 100,
          moonPerPayment: 100,
          accessPrice: 1000n * 10n ** BigInt(await twoLatToken.decimals()),
        },
      ],
      { constructorArgs: [ZeroAddress] },
    );
  });

  const calculateMoonTokenAddress = async (cycle: number) => {
    return calculateCreate2(
      await accessPayment.getAddress(),
      keccak256(encodeParams(["uint256"], [cycle])),
      `0x3d602d80600a3d3981f3363d3d373d3d3d363d73${(await moonTokenImplementation.getAddress()).substring(2)}5af43d82803e903d91602b57fd5bf3`,
      [[], []],
    );
  };

  describe("Cycles", function () {
    it("Should return correct cycle duration", async function () {
      expect(await accessPayment.CYCLE_DURATION()).to.equal(CYCLE_DURATION);
    });
    it("Should revert if not started", async function () {
      await expect(
        accessPayment.getCurrentCycleIndex(),
      ).to.be.revertedWithCustomError(accessPayment, "NotStarted");
    });

    it("Should return correct cycle", async function () {
      await time.increaseTo(startTimestamp);
      expect(await accessPayment.getCurrentCycleIndex()).to.equal(0);
      expect(await accessPayment.getNextCycleIndex()).to.equal(1);
      expect(await accessPayment.getCurrentCycleStartTimestamp()).to.equal(
        startTimestamp,
      );
      expect(await accessPayment.getCurrentCycleEndTimestamp()).to.equal(
        startTimestamp + CYCLE_DURATION,
      );
      expect(await accessPayment.getNextCycleStartTimestamp()).to.equal(
        startTimestamp + CYCLE_DURATION,
      );
      expect(await accessPayment.getNextCycleEndTimestamp()).to.equal(
        startTimestamp + CYCLE_DURATION + CYCLE_DURATION,
      );
    });

    it("Should auto increment cycle", async function () {
      await time.increaseTo(startTimestamp);
      await time.increase(CYCLE_DURATION);
      expect(await accessPayment.getCurrentCycleIndex()).to.equal(1);
      expect(await accessPayment.getNextCycleIndex()).to.equal(2);
      expect(await accessPayment.getCurrentCycleStartTimestamp()).to.equal(
        startTimestamp + CYCLE_DURATION,
      );
      expect(await accessPayment.getCurrentCycleEndTimestamp()).to.equal(
        startTimestamp + CYCLE_DURATION + CYCLE_DURATION,
      );
      expect(await accessPayment.getNextCycleStartTimestamp()).to.equal(
        startTimestamp + CYCLE_DURATION + CYCLE_DURATION,
      );
      expect(await accessPayment.getNextCycleEndTimestamp()).to.equal(
        startTimestamp + CYCLE_DURATION + CYCLE_DURATION + CYCLE_DURATION,
      );
    });
    it("Should revert before start", async function () {
      await expect(
        accessPayment.getOrCreateCurrentCycle(),
      ).to.be.revertedWithCustomError(accessPayment, "NotStarted");
    });

    it("Should revert if cycle is not yet created", async function () {
      await time.increaseTo(startTimestamp);
      await expect(accessPayment.getCycle(0)).to.be.revertedWithCustomError(
        accessPayment,
        "CycleNotCreated",
      );
    });

    it("Should allow creating moon token", async function () {
      await time.increaseTo(startTimestamp);
      await accessPayment.createCycle(0);
      expect(await accessPayment.getCycle(0)).to.not.be.reverted;
    });

    it("Should revert if cycle is already created", async function () {
      await time.increaseTo(startTimestamp);
      await accessPayment.createCycle(0);
      await expect(accessPayment.createCycle(0)).to.be.revertedWithCustomError(
        accessPayment,
        "CycleAlreadyCreated",
      );
    });

    it("Should create current and next moon token address", async function () {
      await time.increaseTo(startTimestamp);
      expect(await accessPayment.getOrCreateCurrentCycle())
        .to.emit(accessPayment, "CycleCreated")
        .withArgs(0, calculateMoonTokenAddress(0));
      expect(await accessPayment.getOrCreateNextCycle())
        .to.emit(accessPayment, "CycleCreated")
        .withArgs(1, calculateMoonTokenAddress(1));
    });

    it("Should auto increment moon token address", async function () {
      await time.increaseTo(startTimestamp);
      await time.increase(CYCLE_DURATION);
      expect(await accessPayment.getOrCreateCurrentCycle())
        .to.emit(accessPayment, "CycleCreated")
        .withArgs(1, calculateMoonTokenAddress(1));
      expect(await accessPayment.getOrCreateNextCycle())
        .to.emit(accessPayment, "CycleCreated")
        .withArgs(2, calculateMoonTokenAddress(2));
    });

    it("Should return correct moon token address", async function () {
      for (let i = 0; i < 10; i++) {
        await accessPayment.createCycle(i);
        expect(
          await accessPayment.getCycle(i).then((cycle) => cycle.moonToken),
        ).to.equal(await calculateMoonTokenAddress(i));
      }
    });
  });

  describe("Payments", function () {
    beforeEach(async function () {
      await twoLatToken
        .connect(owner)
        .transfer(
          user1.address,
          1000n * 10n ** BigInt(await twoLatToken.decimals()),
        );
      await twoLatToken
        .connect(owner)
        .transfer(
          user2.address,
          500n * 10n ** BigInt(await twoLatToken.decimals()),
        );
      await twoLatToken
        .connect(owner)
        .transfer(
          user3.address,
          500000n * 10n ** BigInt(await twoLatToken.decimals()),
        );
      await twoLatToken
        .connect(user2)
        .approve(accessPayment.getAddress(), MaxUint256);
      await twoLatToken
        .connect(user3)
        .approve(accessPayment.getAddress(), MaxUint256);
    });

    it("Should revert if not started", async function () {
      await expect(
        accessPayment.payAccessForNextCycle(),
      ).to.be.revertedWithCustomError(accessPayment, "NotStarted");
    });

    it("Should revert if not enough allowance", async function () {
      await time.increaseTo(startTimestamp);
      await expect(
        accessPayment.connect(user1).payAccessForNextCycle(),
      ).to.be.revertedWithCustomError(
        twoLatToken,
        "ERC20InsufficientAllowance",
      );
    });

    it("Should revert if not enough balance", async function () {
      await time.increaseTo(startTimestamp);
      await expect(
        accessPayment.connect(user2).payAccessForNextCycle(),
      ).to.be.revertedWithCustomError(twoLatToken, "ERC20InsufficientBalance");
    });

    it("Should pass", async function () {
      await time.increaseTo(startTimestamp);
      await expect(accessPayment.connect(user3).payAccessForNextCycle()).to.be
        .not.reverted;
    });

    it("Should revert on repeated payment", async function () {
      await time.increaseTo(startTimestamp);
      await accessPayment.connect(user3).payAccessForNextCycle();
      await expect(
        accessPayment.connect(user3).payAccessForNextCycle(),
      ).to.be.revertedWithCustomError(accessPayment, "AlreadyPaid");
    });

    it("Should mint moon tokens", async function () {
      await time.increaseTo(startTimestamp);
      await accessPayment.connect(user3).payAccessForNextCycle();
      const cycle = await accessPayment.getCycle(1);

      const moonToken = MoonToken__factory.connect(cycle.moonToken, user3);
      expect(await moonToken.balanceOf(user3.address)).to.equal(100);
    });

    it("Should increase cycles in a row", async function () {
      await time.increaseTo(startTimestamp);
      for (let i = 0; i < 10; i++) {
        await accessPayment.connect(user3).payAccessForNextCycle();
        expect(
          await accessPayment.getUser(user3.address).then((u) => u.cyclesInRow),
        ).to.be.equal(i + 1);
        await time.increase(CYCLE_DURATION);
      }
    });

    it("Should reset cycles in row", async function () {
      await time.increaseTo(startTimestamp);
      await accessPayment.connect(user3).payAccessForNextCycle();
      expect(
        await accessPayment.getUser(user3.address).then((u) => u.cyclesInRow),
      ).to.be.equal(1);
      await time.increase(CYCLE_DURATION);
      await time.increase(CYCLE_DURATION);
      await accessPayment.connect(user3).payAccessForNextCycle();
      expect(
        await accessPayment.getUser(user3.address).then((u) => u.cyclesInRow),
      ).to.be.equal(1);
    });

    it("Should burn $2LAT on skip payment", async function () {
      await time.increaseTo(startTimestamp);
      await accessPayment.connect(user3).payAccessForNextCycle();
      await time.increase(CYCLE_DURATION);
      await time.increase(CYCLE_DURATION);
      await accessPayment.connect(user3).payAccessForNextCycle();
      await time.increase(CYCLE_DURATION);
      await accessPayment.connect(user3).payAccessForNextCycle();
      expect(await twoLatToken.totalSupply()).to.be.equal(
        1_000_000_000n * 10n ** BigInt(await twoLatToken.decimals()) -
          900n * 10n ** BigInt(await twoLatToken.decimals()),
      );
    });
  });

  describe("Access", function () {
    beforeEach(async function () {
      await twoLatToken
        .connect(owner)
        .transfer(
          user1.address,
          100000n * 10n ** BigInt(await twoLatToken.decimals()),
        );

      await twoLatToken
        .connect(user1)
        .approve(accessPayment.getAddress(), MaxUint256);
    });
    it("Should have no access before payment", async function () {
      await time.increaseTo(startTimestamp);
      expect(await accessPayment.hasAccess(user1.address)).to.be.equal(false);
    });

    it("Should allow access after payment", async function () {
      await time.increaseTo(startTimestamp);
      await accessPayment.connect(user1).payAccessForNextCycle();
      await time.increase(CYCLE_DURATION);
      expect(await accessPayment.hasAccess(user1.address)).to.be.equal(true);
    });

    it("Should have no access before cycle starts", async function () {
      await time.increaseTo(startTimestamp);
      await accessPayment.connect(user1).payAccessForNextCycle();
      expect(await accessPayment.hasAccess(user1.address)).to.be.equal(false);
    });
    it("Should have no access after cycle ends", async function () {
      await time.increaseTo(startTimestamp);
      await accessPayment.connect(user1).payAccessForNextCycle();
      await time.increase(CYCLE_DURATION * 2);
      expect(await accessPayment.hasAccess(user1.address)).to.be.equal(false);
    });
  });

  describe("Behavior", function () {
    it("Should execute flow", async function () {
      
      const accessPrice = config.accessPrice;
      const lockAmount = config.accessPrice * BigInt(config.lockFraction) / 1000n;
      
      const decimals = await twoLatToken.decimals();
      await Promise.all(
        [user1, user2, user3].map(async (user) =>
          Promise.all([
            twoLatToken.connect(owner).transfer(user.address, 100000n * 10n ** decimals),
            twoLatToken.connect(user).approve(accessPayment.getAddress(), MaxUint256),
          ]),
        ),
      );
      const [
        user1BalanceBefore,
        user2BalanceBefore,
        user3BalanceBefore,
      ] = await Promise.all(
        [user1, user2, user3].map(async (user) =>
          twoLatToken.balanceOf(user.address),
        ),
      );
      const totalSupplyBefore = await twoLatToken.totalSupply();

      await time.increaseTo(startTimestamp);
      await accessPayment.connect(user1).payAccessForNextCycle(); 
      await time.increase(CYCLE_DURATION);
      await accessPayment.connect(user3).payAccessForNextCycle();
      await time.increase(CYCLE_DURATION);
      await accessPayment.connect(user1).payAccessForNextCycle();
      await accessPayment.connect(user2).payAccessForNextCycle(); // 1 - 1 burns
      await time.increase(CYCLE_DURATION);
      await accessPayment.connect(user2).payAccessForNextCycle(); // 2 - 3 burns
      await accessPayment.connect(user1).payAccessForNextCycle();
      await accessPayment.connect(user3).payAccessForNextCycle();
      await time.increase(CYCLE_DURATION);
      await accessPayment.connect(user1).payAccessForNextCycle(); // 2 - no burns
      await accessPayment.connect(user2).payAccessForNextCycle();
      await accessPayment.connect(user3).payAccessForNextCycle();
      await time.increase(CYCLE_DURATION);
      expect(await accessPayment.connect(user1).payAccessForNextCycle()).to.emit(accessPayment, "LockReleased").withArgs(user1.address, lockAmount); // 2 - no burns
      await accessPayment.connect(user2).payAccessForNextCycle();
      await time.increase(CYCLE_DURATION);
      await accessPayment.connect(user2).payAccessForNextCycle(); // 3 - 3 burns
      await time.increase(CYCLE_DURATION);
      await time.increase(CYCLE_DURATION);

      await accessPayment.burnLocked(user1.address);
      await accessPayment.burnLocked(user2.address);
      await accessPayment.burnLocked(user3.address);

      expect(await twoLatToken.balanceOf(accessPayment.getAddress())).to.be.equal(0);

      const [
        user1BalanceAfter,
        user2BalanceAfter,
        user3BalanceAfter,
      ] = await Promise.all(
        [user1, user2, user3].map(async (user) =>
          twoLatToken.balanceOf(user.address),
        ),
      );

      expect(user1BalanceAfter).to.be.equal(user1BalanceBefore - accessPrice * 5n + lockAmount * 1n);
      expect(user2BalanceAfter).to.be.equal(user2BalanceBefore - accessPrice * 5n + lockAmount * 2n);
      expect(user3BalanceAfter).to.be.equal(user3BalanceBefore - accessPrice * 3n);

      const totalSupplyAfter = await twoLatToken.totalSupply();
      expect(totalSupplyAfter).to.be.equal(totalSupplyBefore - lockAmount * 10n);
    });
  });
});
