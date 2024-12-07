// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title TimeLockController
/// @notice Delays execution of sensitive operations to allow review and potential cancellation.
/// @dev Added cancel operation and events for better governance control.
contract TimeLockController {
    uint256 public minDelay;
    mapping(bytes32 => uint256) public timestamps;

    error NotReadyForExecution(bytes32 operationId);
    error OperationNotScheduled(bytes32 operationId);
    error OperationNotCancellable(bytes32 operationId);

    event OperationScheduled(bytes32 indexed operationId, uint256 executeAt);
    event OperationExecuted(bytes32 indexed operationId, address target, uint256 value, bytes data);
    event OperationCancelled(bytes32 indexed operationId);

    constructor(uint256 _minDelay) {
        minDelay = _minDelay;
    }

    function schedule(bytes32 operationId) external {
        uint256 executeAt = block.timestamp + minDelay;
        timestamps[operationId] = executeAt;
        emit OperationScheduled(operationId, executeAt);
    }

    function cancel(bytes32 operationId) external {
        uint256 executionTime = timestamps[operationId];
        if (executionTime == 0) revert OperationNotScheduled(operationId);
        // Allow anyone to cancel if desired, or restrict to certain roles as needed.
        delete timestamps[operationId];
        emit OperationCancelled(operationId);
    }

    function execute(bytes32 operationId, address target, uint256 value, bytes calldata data) external {
        uint256 executionTime = timestamps[operationId];
        if (executionTime == 0) revert OperationNotScheduled(operationId);
        if (block.timestamp < executionTime) revert NotReadyForExecution(operationId);

        delete timestamps[operationId];
        (bool success,) = target.call{value: value}(data);
        require(success, "Execution failed");
        emit OperationExecuted(operationId, target, value, data);
    }
}
