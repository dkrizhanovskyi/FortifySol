// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title ReentrancyGuarded
/// @notice Protects functions from reentrant calls.
abstract contract ReentrancyGuarded {
    uint256 private _status;
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    error ReentrantCall();

    constructor() {
        _status = _NOT_ENTERED;
    }

    modifier nonReentrant() {
        if (_status == _ENTERED) revert ReentrantCall();
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
}
