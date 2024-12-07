const { expect } = require("chai");
const { ethers } = require("hardhat");

// Tests the MultiSigWallet contract.
// Verifies that transactions require multiple approvals before execution.
describe("MultiSigWallet", function () {
  let MultiSigWallet, multiSig;
  let signers, required, to, value, data;

  beforeEach(async function () {
    signers = await ethers.getSigners();
    // Use the first three as signers
    const signerAddresses = signers.slice(0, 3).map(s => s.address);
    required = 2; // Need 2 out of 3 approvals

    MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
    multiSig = await MultiSigWallet.deploy(signerAddresses, required);
    await multiSig.deployed();

    to = signers[3].address;
    value = ethers.utils.parseEther("1");
    data = "0x"; // no data
    // Fund the wallet
    await signers[0].sendTransaction({ to: multiSig.address, value });
  });

  it("should submit and approve a transaction", async function () {
    await expect(multiSig.connect(signers[0]).submitTransaction(to, value, data))
      .to.emit(multiSig, "TransactionSubmitted");

    // Approve by signer[0]
    await expect(multiSig.connect(signers[0]).approveTransaction(0))
      .to.emit(multiSig, "TransactionApproved")
      .withArgs(0, signers[0].address);

    // Approve by signer[1]
    await expect(multiSig.connect(signers[1]).approveTransaction(0))
      .to.emit(multiSig, "TransactionApproved")
      .withArgs(0, signers[1].address);

    // Execute after required approvals
    await expect(multiSig.connect(signers[0]).executeTransaction(0))
      .to.emit(multiSig, "TransactionExecuted")
      .withArgs(0);
  });

  it("should revert execution if not enough approvals", async function () {
    await multiSig.connect(signers[0]).submitTransaction(to, value, data);
    // Only one signer approves
    await multiSig.connect(signers[0]).approveTransaction(0);
    await expect(multiSig.connect(signers[0]).executeTransaction(0)).to.be.revertedWithCustomError(
      multiSig,
      "NotEnoughApprovals"
    );
  });
});
