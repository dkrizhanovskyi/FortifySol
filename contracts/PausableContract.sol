// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title PausableContract
/// @notice Allows authorized users to pause and unpause functionality in emergencies.
contract PausableContract {
    bool public paused;
    address public pauser;

    error NotPauser(address caller);
    error ContractPaused();

    event Paused(address indexed pauser);
    event Unpaused(address indexed pauser);

    modifier onlyPauser() {
        if (msg.sender != pauser) revert NotPauser(msg.sender);
        _;
    }

    modifier whenNotPaused() {
        if (paused) revert ContractPaused();
        _;
    }

    constructor() {
        pauser = msg.sender;
    }

    function pause() external onlyPauser {
        paused = true;
        emit Paused(msg.sender);
    }

    function unpause() external onlyPauser {
        paused = false;
        emit Unpaused(msg.sender);
    }

    function safeAction() external whenNotPaused {
        // Some operation allowed only when not paused
    }
}
