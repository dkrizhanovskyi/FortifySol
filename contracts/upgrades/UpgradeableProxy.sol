// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title UpgradeableProxy
/// @notice A proxy contract that delegates calls to an implementation logic contract.
/// @dev Emits an event on upgrade for auditability.
contract UpgradeableProxy {
    bytes32 internal constant IMPLEMENTATION_SLOT = keccak256("my.upgradeableproxy.implementation");
    address public admin;

    error NotAdmin(address caller);
    error ImplementationNotSet();

    event Upgraded(address indexed newImplementation);

    constructor(address _logic) {
        admin = msg.sender;
        _setImplementation(_logic);
    }

    modifier onlyAdmin() {
        if (msg.sender != admin) revert NotAdmin(msg.sender);
        _;
    }

    function upgradeTo(address newImplementation) external onlyAdmin {
        _setImplementation(newImplementation);
        emit Upgraded(newImplementation);
    }

    fallback() external payable {
        address impl = _implementation();
        if (impl == address(0)) revert ImplementationNotSet();

        assembly {
            calldatacopy(0, 0, calldatasize())
            let result := delegatecall(gas(), impl, 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())

            switch result
            case 0 { revert(0, returndatasize()) }
            default { return(0, returndatasize()) }
        }
    }

    function _setImplementation(address newImpl) internal {
        bytes32 slot = IMPLEMENTATION_SLOT;
        assembly {
            sstore(slot, newImpl)
        }
    }

    function _implementation() internal view returns (address impl) {
        bytes32 slot = IMPLEMENTATION_SLOT;
        assembly {
            impl := sload(slot)
        }
    }
}

