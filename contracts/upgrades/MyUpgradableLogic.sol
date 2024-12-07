// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title MyUpgradableLogic
/// @notice A simple logic contract example to demonstrate upgradability.
/// @dev Added an event for increment operations.
contract MyUpgradableLogic {
    uint256 public counter;

    error OverflowOccurred();

    event CounterIncremented(uint256 newCounter);

    function increment() external {
        // Under ^0.8.x, overflow reverts automatically, no need for explicit check.
        counter++;
        emit CounterIncremented(counter);
    }
}
