// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title RoleManager
/// @notice Provides role-based access control to ensure restricted function calls.
/// @dev Uses events for transparency and custom errors for efficient reverts.
contract RoleManager {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    mapping(bytes32 => mapping(address => bool)) private _roles;

    error Unauthorized(address caller, bytes32 role);
    error ZeroAddressNotAllowed();

    event RoleGranted(bytes32 indexed role, address indexed account);
    event RoleRevoked(bytes32 indexed role, address indexed account);

    constructor(address _admin) {
        if (_admin == address(0)) revert ZeroAddressNotAllowed();
        _grantRole(ADMIN_ROLE, _admin);
    }

    modifier onlyRole(bytes32 role) {
        if (!_hasRole(role, msg.sender)) revert Unauthorized(msg.sender, role);
        _;
    }

    function grantRole(bytes32 role, address account) external onlyRole(ADMIN_ROLE) {
        if (account == address(0)) revert ZeroAddressNotAllowed();
        _grantRole(role, account);
    }

    function revokeRole(bytes32 role, address account) external onlyRole(ADMIN_ROLE) {
        _roles[role][account] = false;
        emit RoleRevoked(role, account);
    }

    function hasRole(bytes32 role, address account) external view returns (bool) {
        return _hasRole(role, account);
    }

    function _hasRole(bytes32 role, address account) internal view returns (bool) {
        return _roles[role][account];
    }

    function _grantRole(bytes32 role, address account) internal {
        _roles[role][account] = true;
        emit RoleGranted(role, account);
    }
}
