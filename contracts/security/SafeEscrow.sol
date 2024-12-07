// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title SafeEscrow
/// @notice Holds funds until conditions are met, then releases them to a beneficiary.
/// @dev Added events and zero-address checks.
contract SafeEscrow {
    address public depositor;
    address public beneficiary;
    uint256 public depositAmount;
    bool public released;

    error NotDepositor(address caller);
    error AlreadyReleased();
    error ConditionsNotMet();
    error ZeroAddressBeneficiary();

    event Deposited(address indexed depositor, uint256 amount);
    event Released(address indexed beneficiary, uint256 amount);

    modifier onlyDepositor() {
        if (msg.sender != depositor) revert NotDepositor(msg.sender);
        _;
    }

    constructor(address _beneficiary) payable {
        if (_beneficiary == address(0)) revert ZeroAddressBeneficiary();
        depositor = msg.sender;
        beneficiary = _beneficiary;
        depositAmount = msg.value;
        emit Deposited(depositor, depositAmount);
    }

    function release() external onlyDepositor {
        if (released) revert AlreadyReleased();
        if (!_checkConditions()) revert ConditionsNotMet();
        released = true;
        (bool sent,) = beneficiary.call{value: depositAmount}("");
        require(sent, "Transfer failed");
        emit Released(beneficiary, depositAmount);
    }

    function _checkConditions() internal view returns (bool) {
        // Implement real conditions as needed.
        return true;
    }
}
