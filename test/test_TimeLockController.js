const { expect } = require("chai");
const { ethers } = require("hardhat");

// Tests the TimeLockController contract.
// Checks that scheduled operations cannot be executed before the delay and can be cancelled.
describe("TimeLockController", function () {
  let TimeLockController, tlc;
  let delay = 100; // seconds
  let operationId, target, value, data;
  let owner;

  beforeEach(async function () {
    [owner, target] = await ethers.getSigners();
    TimeLockController = await ethers.getContractFactory("TimeLockController");
    tlc = await TimeLockController.deploy(delay);
    await tlc.deployed();

    operationId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("operation1"));
    value = 0;
    data = "0x";
  });

  it("should schedule and then fail to execute before delay", async function () {
    await expect(tlc.schedule(operationId))
      .to.emit(tlc, "OperationScheduled")
      .withArgs(operationId, (await ethers.provider.getBlock("latest")).timestamp + delay);

    await expect(tlc.execute(operationId, target.address, value, data))
      .to.be.revertedWithCustomError(tlc, "NotReadyForExecution");
  });

  it("should allow cancellation of scheduled operations", async function () {
    await tlc.schedule(operationId);
    await expect(tlc.cancel(operationId))
      .to.emit(tlc, "OperationCancelled")
      .withArgs(operationId);

    await expect(tlc.execute(operationId, target.address, value, data))
      .to.be.revertedWithCustomError(tlc, "OperationNotScheduled");
  });

  it("should execute after delay", async function () {
    await tlc.schedule(operationId);
    // Increase time to surpass the delay
    await ethers.provider.send("evm_increaseTime", [delay + 1]);
    await ethers.provider.send("evm_mine", []); // mine a new block
    await expect(tlc.execute(operationId, target.address, value, data))
      .to.emit(tlc, "OperationExecuted")
      .withArgs(operationId, target.address, value, data);
  });
});
