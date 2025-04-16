import { expect } from "chai";
import { ethers } from "hardhat";
import { TwoLatToken, MinimalForwarder, ERC2771Forwarder } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { MaxUint256 } from "ethers";

describe("TwoLatToken", function () {
  let token: TwoLatToken;
  let forwarder: MinimalForwarder;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;

  const TOTAL_SUPPLY = ethers.parseEther("1000000000"); // 1 billion tokens

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    const Forwarder = await ethers.getContractFactory("MinimalForwarder");
    forwarder = await Forwarder.deploy();
    const forwarderAddress = await forwarder.getAddress();

    const Token = await ethers.getContractFactory("TwoLatToken");
    token = await Token.deploy(forwarderAddress);
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

  describe("Meta Transactions (Permit)", function () {
    const approveAmount = ethers.parseEther("500");
    let deadline: number;

    beforeEach(async function () {
      // Set deadline 1 hour from now
      const block = await ethers.provider.getBlock("latest");
      if (!block) throw new Error("Failed to get latest block");
      deadline = block.timestamp + 3600;
    });

    async function getPermitSignature(
      signer: HardhatEthersSigner,
      spender: string,
      value: bigint,
      nonce: bigint,
      deadline: number
    ) {
      const chainId = (await ethers.provider.getNetwork()).chainId;
      const tokenAddress = await token.getAddress();
      const tokenName = await token.name();

      const domain = {
        name: tokenName,
        version: "1",
        chainId: chainId,
        verifyingContract: tokenAddress,
      };

      const types = {
        Permit: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
          { name: "value", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      };

      const message = {
        owner: signer.address,
        spender: spender,
        value: value,
        nonce: nonce,
        deadline: deadline,
      };

      const signature = await signer.signTypedData(domain, types, message);
      return ethers.Signature.from(signature);
    }

    it("Should allow approval via permit signature", async function () {
      const nonce = await token.nonces(owner.address);
      const sig = await getPermitSignature(
        owner,
        user1.address,
        approveAmount,
        nonce,
        deadline
      );

      await token.permit(
        owner.address,
        user1.address,
        approveAmount,
        deadline,
        sig.v,
        sig.r,
        sig.s
      );

      expect(await token.allowance(owner.address, user1.address)).to.equal(approveAmount);
      expect(await token.nonces(owner.address)).to.equal(nonce + 1n);
    });

    it("Should emit Approval event on successful permit", async function () {
        const nonce = await token.nonces(owner.address);
        const sig = await getPermitSignature(
          owner,
          user1.address,
          approveAmount,
          nonce,
          deadline
        );
  
        await expect(token.permit(
          owner.address,
          user1.address,
          approveAmount,
          deadline,
          sig.v,
          sig.r,
          sig.s
        ))
        .to.emit(token, "Approval")
        .withArgs(owner.address, user1.address, approveAmount);
      });

    it("Should reject expired permit", async function () {
      const nonce = await token.nonces(owner.address);
      const expiredDeadline = (await ethers.provider.getBlock("latest"))!.timestamp - 1;
      const sig = await getPermitSignature(
        owner,
        user1.address,
        approveAmount,
        nonce,
        expiredDeadline
      );

      await expect(
        token.permit(
          owner.address,
          user1.address,
          approveAmount,
          expiredDeadline,
          sig.v,
          sig.r,
          sig.s
        )
      ).to.be.revertedWithCustomError(token, "ERC2612ExpiredSignature");
    });

    it("Should reject reused permit signature (invalid nonce)", async function () {
        const nonce = await token.nonces(owner.address);
        const sig = await getPermitSignature(
          owner,
          user1.address,
          approveAmount,
          nonce,
          deadline
        );
  
        // Use the permit once
        await token.permit(
          owner.address,
          user1.address,
          approveAmount,
          deadline,
          sig.v,
          sig.r,
          sig.s
        );
  
        // Try to use it again
        await expect(token.permit(
          owner.address,
          user1.address,
          approveAmount,
          deadline,
          sig.v,
          sig.r,
          sig.s
        ))
        .to.be.revertedWithCustomError(token, "ERC2612InvalidSigner"); // OZ uses InvalidSigner for nonce mismatch
      });

      it("Should reject permit with invalid signature", async function () {
        const nonce = await token.nonces(owner.address);
        // Get a valid signature first
        const sig = await getPermitSignature(
          owner,
          user1.address, // Correct spender
          approveAmount,
          nonce,
          deadline
        );
        
        // Attempt permit with a different spender than signed for
        await expect(token.permit(
          owner.address,
          user2.address, // Incorrect spender
          approveAmount,
          deadline,
          sig.v,
          sig.r,
          sig.s
        ))
        .to.be.revertedWithCustomError(token, "ERC2612InvalidSigner"); 
      });
  });

  describe("Meta Transactions (Forwarder)", function () {
    const transferAmount = ethers.parseEther("300");
    let deadline: number;

    beforeEach(async function () {
      // Set deadline 1 hour from now
      const block = await ethers.provider.getBlock("latest");
      if (!block) throw new Error("Failed to get latest block");
      deadline = block.timestamp + 3600;
    });


    type ForwardRequest = Omit<ERC2771Forwarder.ForwardRequestDataStruct, "signature"> & {
        nonce: bigint;
    };

    async function getForwarderSignature(
      signer: HardhatEthersSigner,
      request: ForwardRequest // Revert to using local type alias
    ) {
        const chainId = (await ethers.provider.getNetwork()).chainId;
        const forwarderAddress = await forwarder.getAddress();

        const domain = {
            name: "Second Latitude Forwarder", 
            version: "1", 
            chainId: chainId,
            verifyingContract: forwarderAddress
        };

        const types = {
            ForwardRequest: [
                { name: 'from', type: 'address' },
                { name: 'to', type: 'address' },
                { name: 'value', type: 'uint256' },
                { name: 'gas', type: 'uint256' },
                { name: 'nonce', type: 'uint256' },
                { name: 'deadline', type: 'uint48' },
                { name: 'data', type: 'bytes' },
            ]
        };

        // Ensure the object passed to signTypedData matches the types structure
        const messageToSign: Record<string, any> = {};
        types.ForwardRequest.forEach(field => {
            messageToSign[field.name] = (request as any)[field.name];
        });

        const signature = await signer.signTypedData(domain, types, messageToSign);
        return signature;
    }

    it("Should allow transferring tokens via forwarder", async function () {
        const tokenAddress = await token.getAddress();
        const ownerAddress = owner.address;
        const user1Address = user1.address;
        const forwarderAddress = await forwarder.getAddress();

        const transferData = token.interface.encodeFunctionData("transfer", [
            user1Address,
            transferAmount
        ]);

        // Call getNonce - assuming it exists despite potential type issues
        const nonce = await forwarder.nonces(ownerAddress); 
        const request: ForwardRequest = {
            from: ownerAddress,
            to: tokenAddress,
            value: 0n,
            gas: 100000n, 
            nonce: nonce,
            data: transferData,
            deadline,
        };

        const signature = await getForwarderSignature(owner, request);

        const initialOwnerBalance = await token.balanceOf(ownerAddress);
        const initialUser1Balance = await token.balanceOf(user1Address);

        // Call execute with request object and signature
        await expect(forwarder.connect(user2).execute({
            ...request,
            signature: signature
        }))
            .to.emit(token, "Transfer")
            .withArgs(ownerAddress, user1Address, transferAmount);

        expect(await token.balanceOf(ownerAddress)).to.equal(initialOwnerBalance - transferAmount);
        expect(await token.balanceOf(user1Address)).to.equal(initialUser1Balance + transferAmount);
        expect(await forwarder.nonces(ownerAddress)).to.equal(nonce + 1n);
    });

    it("Should reject forwarder request with invalid signature", async function () {
        const tokenAddress = await token.getAddress();
        const ownerAddress = owner.address;
        const user1Address = user1.address;
        const forwarderAddress = await forwarder.getAddress();

        await token.connect(owner).approve(forwarderAddress, transferAmount);

        const transferData = token.interface.encodeFunctionData("transferFrom", [
            ownerAddress,
            user1Address,
            transferAmount
        ]);

        const nonce = await forwarder.nonces(ownerAddress);
        const request: ForwardRequest = {
            from: ownerAddress,
            to: tokenAddress,
            value: 0n,
            gas: 100000n,
            nonce: nonce,
            data: transferData,
            deadline,
        };

        const invalidSignature = await getForwarderSignature(user1, request);

        await expect(
            forwarder.connect(user2).execute({
                ...request,
                signature: invalidSignature
            })
        ).to.be.revertedWithCustomError(forwarder, "ERC2771ForwarderInvalidSigner");
    });

    it("Should reject forwarder request with incorrect nonce", async function () {
        const tokenAddress = await token.getAddress();
        const ownerAddress = owner.address;
        const user1Address = user1.address;
        const forwarderAddress = await forwarder.getAddress();

        await token.connect(owner).approve(forwarderAddress, transferAmount);

        const transferData = token.interface.encodeFunctionData("transferFrom", [
            ownerAddress,
            user1Address,
            transferAmount
        ]);

        const currentNonce = await forwarder.nonces(ownerAddress);
        const incorrectNonce = currentNonce + 1n; 
        const request: ForwardRequest = {
            from: ownerAddress, 
            to: tokenAddress,
            value: 0n,
            gas: 100000n,
            nonce: incorrectNonce,
            data: transferData,
            deadline,
        };

        const signature = await getForwarderSignature(owner, request);

        await expect(
            forwarder.connect(user2).execute({
                ...request,
                signature: signature
            })
        ).to.be.revertedWithCustomError(forwarder, "ERC2771ForwarderInvalidSigner"); 
    });

    it("Should allow transfer via forwarder using permit signature", async function () {
      const tokenAddress = await token.getAddress();
      const ownerAddress = owner.address;
      const user1Address = user1.address;
      const forwarderAddress = await forwarder.getAddress();
      const permitAmount = ethers.parseEther("400");

      const permitNonce = await token.nonces(ownerAddress);
      const block = await ethers.provider.getBlock("latest");
      if (!block) throw new Error("Failed to get latest block");
      const deadline = block.timestamp + 3600;

      type Permit = {
        owner: string;
        spender: string;
        value: bigint;
        nonce: bigint;
        deadline: number;
      };

      const permitSig = await (async () => {
          const chainId = (await ethers.provider.getNetwork()).chainId;
          const tokenName = await token.name();
          const domain = { name: tokenName, version: "1", chainId: chainId, verifyingContract: tokenAddress };
          const types = { Permit: [ { name: "owner", type: "address" }, { name: "spender", type: "address" }, { name: "value", type: "uint256" }, { name: "nonce", type: "uint256" }, { name: "deadline", type: "uint256" } ] };
          const message: Permit = { owner: ownerAddress, spender: user1Address, value: permitAmount, nonce: permitNonce, deadline: deadline };
          return ethers.Signature.from(await owner.signTypedData(domain, types, message));
      })();

      const permitData = token.interface.encodeFunctionData("permit", [
          ownerAddress,
          user1Address,
          permitAmount,
          deadline,
          permitSig.v,
          permitSig.r,
          permitSig.s
      ]);

      const forwarderNoncePermit = await forwarder.nonces(ownerAddress);
      const permitRequest: ForwardRequest = {
          from: ownerAddress,
          to: tokenAddress,
          value: 0n,
          gas: 150000n, 
          nonce: forwarderNoncePermit,
          data: permitData,
          deadline,
      };

      const permitForwardSig = await getForwarderSignature(owner, permitRequest);

      await expect(forwarder.connect(user2).execute({
        ...permitRequest,
        signature: permitForwardSig
      }))
          .to.emit(token, "Approval")
          .withArgs(ownerAddress, user1Address, permitAmount);

      expect(await token.allowance(ownerAddress, user1Address)).to.equal(permitAmount);
      expect(await token.nonces(ownerAddress)).to.equal(permitNonce + 1n);
      expect(await forwarder.nonces(ownerAddress)).to.equal(forwarderNoncePermit + 1n);

      const transferData = token.interface.encodeFunctionData("transferFrom", [
          ownerAddress,
          user1Address,
          permitAmount 
      ]);

      const forwarderNonceTransfer = await forwarder.nonces(user1Address);
      const transferRequest: ForwardRequest = {
          from: user1Address,
          to: tokenAddress,
          value: 0n,
          gas: 100000n,
          nonce: forwarderNonceTransfer,
          data: transferData,
          deadline,
      };

      const transferForwardSig = await getForwarderSignature(user1, transferRequest);

      const initialOwnerBalance = await token.balanceOf(ownerAddress);
      const initialUser1Balance = await token.balanceOf(user1Address);

      await expect(forwarder.connect(user2).execute({
        ...transferRequest,
        signature: transferForwardSig
      }))
          .to.emit(token, "Transfer")
          .withArgs(ownerAddress, user1Address, permitAmount);

      expect(await token.balanceOf(ownerAddress)).to.equal(initialOwnerBalance - permitAmount);
      expect(await token.balanceOf(user1Address)).to.equal(initialUser1Balance + permitAmount);
      expect(await token.allowance(ownerAddress, forwarderAddress)).to.equal(0);
      expect(await forwarder.nonces(ownerAddress)).to.equal(forwarderNonceTransfer + 1n);
    });
  });
});