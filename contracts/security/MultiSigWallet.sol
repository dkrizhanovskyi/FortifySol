// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title MultiSigWallet
/// @notice Requires multiple authorized signatures for transaction execution.
/// @dev Uses a mapping for signers to ensure O(1) checks. Emits events for all actions.
contract MultiSigWallet {
    mapping(address => bool) public isSigner;
    uint256 public required;

    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 approvalsCount;
    }

    Transaction[] public transactions;
    mapping(uint256 => mapping(address => bool)) public approvals;

    error NotASigner(address caller);
    error AlreadyApproved(uint256 txIndex, address caller);
    error NotEnoughApprovals(uint256 txIndex);
    error ExecutionFailed(uint256 txIndex);
    error InvalidRequirement();

    event TransactionSubmitted(uint256 indexed txIndex, address indexed to, uint256 value, bytes data);
    event TransactionApproved(uint256 indexed txIndex, address indexed signer);
    event TransactionExecuted(uint256 indexed txIndex);

    constructor(address[] memory _signers, uint256 _required) {
        if (_required == 0 || _required > _signers.length) revert InvalidRequirement();

        for (uint i = 0; i < _signers.length; i++) {
            address s = _signers[i];
            require(s != address(0), "Zero address signer not allowed");
            isSigner[s] = true;
        }
        required = _required;
    }

    modifier onlySigner() {
        if (!isSigner[msg.sender]) revert NotASigner(msg.sender);
        _;
    }

    function submitTransaction(address _to, uint256 _value, bytes calldata _data) external onlySigner {
        transactions.push(Transaction(_to, _value, _data, false, 0));
        emit TransactionSubmitted(transactions.length - 1, _to, _value, _data);
    }

    function approveTransaction(uint256 _txIndex) external onlySigner {
        if (approvals[_txIndex][msg.sender]) revert AlreadyApproved(_txIndex, msg.sender);

        approvals[_txIndex][msg.sender] = true;
        transactions[_txIndex].approvalsCount++;
        emit TransactionApproved(_txIndex, msg.sender);
    }

    function executeTransaction(uint256 _txIndex) external onlySigner {
        Transaction storage txn = transactions[_txIndex];
        if (txn.executed) revert ExecutionFailed(_txIndex);
        if (txn.approvalsCount < required) revert NotEnoughApprovals(_txIndex);

        (bool success,) = txn.to.call{value: txn.value}(txn.data);
        if (!success) revert ExecutionFailed(_txIndex);

        txn.executed = true;
        emit TransactionExecuted(_txIndex);
    }

    receive() external payable {}
}
