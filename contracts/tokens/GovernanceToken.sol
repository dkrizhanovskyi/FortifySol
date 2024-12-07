// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../access/RoleManager.sol";

/// @title GovernanceToken
/// @notice An ERC20-like governance token. Integrates with RoleManager for minting.
/// @dev Ensures zero-address safety and uses custom errors. Fully evented.
contract GovernanceToken {
    string public name = "MyGovToken";
    string public symbol = "MGT";
    uint8 public immutable decimals = 18;
    uint256 public totalSupply;

    RoleManager public roleManager;
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    mapping(address => uint256) private balances;
    mapping(address => mapping(address => uint256)) private allowances;

    error NotMinter(address caller);
    error ZeroAddressNotAllowed();
    error InsufficientBalance(address caller, uint256 requested, uint256 available);
    error AllowanceExceeded(address spender, uint256 requested, uint256 allowed);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(address _roleManager) {
        if (_roleManager == address(0)) revert ZeroAddressNotAllowed();
        roleManager = RoleManager(_roleManager);
    }

    function mint(address to, uint256 amount) external {
        if (!roleManager.hasRole(MINTER_ROLE, msg.sender)) revert NotMinter(msg.sender);
        if (to == address(0)) revert ZeroAddressNotAllowed();
        totalSupply += amount;
        balances[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function balanceOf(address account) external view returns (uint256) {
        return balances[account];
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        if (to == address(0)) revert ZeroAddressNotAllowed();
        uint256 senderBalance = balances[msg.sender];
        if (senderBalance < amount) revert InsufficientBalance(msg.sender, amount, senderBalance);
        balances[msg.sender] = senderBalance - amount;
        balances[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        if (spender == address(0)) revert ZeroAddressNotAllowed();
        allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function allowance(address owner, address spender) external view returns (uint256) {
        return allowances[owner][spender];
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        if (to == address(0)) revert ZeroAddressNotAllowed();
        uint256 fromBalance = balances[from];
        if (fromBalance < amount) revert InsufficientBalance(from, amount, fromBalance);

        uint256 allowed = allowances[from][msg.sender];
        if (allowed < amount) revert AllowanceExceeded(msg.sender, amount, allowed);

        balances[from] = fromBalance - amount;
        balances[to] += amount;
        allowances[from][msg.sender] = allowed - amount;

        emit Transfer(from, to, amount);
        return true;
    }
}
