// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./utilities/ReentrancyGuarded.sol";

/// @title Vault
/// @notice Securely holds and releases funds with protection against reentrancy attacks.
/// @dev Emits events for deposits and withdrawals.
contract Vault is ReentrancyGuarded {
    mapping(address => uint256) public deposits;

    error InsufficientBalance(address caller, uint256 requested, uint256 available);

    event Deposited(address indexed depositor, uint256 amount);
    event Withdrawn(address indexed withdrawer, uint256 amount);

    function deposit() external payable {
        deposits[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external nonReentrant {
        uint256 balance = deposits[msg.sender];
        if (balance < amount) revert InsufficientBalance(msg.sender, amount, balance);

        deposits[msg.sender] = balance - amount;
        (bool sent,) = msg.sender.call{value: amount}("");
        require(sent, "Withdraw failed");
        emit Withdrawn(msg.sender, amount);
    }
}
