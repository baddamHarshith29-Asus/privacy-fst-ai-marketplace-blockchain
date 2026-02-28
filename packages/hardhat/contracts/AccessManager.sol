// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AccessManager
 * @dev Manages dataset access control for the AI Data Marketplace on Monad.
 *      Controls who can access encrypted datasets after purchase.
 */
contract AccessManager is Ownable {
    // ─── State ────────────────────────────────────────────────────────────────

    // datasetId => buyer => hasAccess
    mapping(uint256 => mapping(address => bool)) private _accessGrants;

    // datasetId => list of granted addresses
    mapping(uint256 => address[]) private _accessList;

    // marketplace contract address (only it can grant access)
    address public marketplace;

    // ─── Events ───────────────────────────────────────────────────────────────

    event AccessGranted(uint256 indexed datasetId, address indexed user);
    event AccessRevoked(uint256 indexed datasetId, address indexed user);
    event MarketplaceUpdated(address indexed newMarketplace);

    // ─── Modifiers ────────────────────────────────────────────────────────────

    modifier onlyMarketplace() {
        require(msg.sender == marketplace || msg.sender == owner(), "AccessManager: caller not authorized");
        _;
    }

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor() Ownable(msg.sender) {}

    // ─── External Functions ───────────────────────────────────────────────────

    /**
     * @notice Set the marketplace contract address
     */
    function setMarketplace(address _marketplace) external onlyOwner {
        require(_marketplace != address(0), "AccessManager: zero address");
        marketplace = _marketplace;
        emit MarketplaceUpdated(_marketplace);
    }

    /**
     * @notice Grant access to a dataset for a user (called by marketplace after purchase)
     */
    function grantAccess(uint256 datasetId, address user) external onlyMarketplace {
        require(user != address(0), "AccessManager: zero address");
        if (!_accessGrants[datasetId][user]) {
            _accessGrants[datasetId][user] = true;
            _accessList[datasetId].push(user);
            emit AccessGranted(datasetId, user);
        }
    }

    /**
     * @notice Revoke access from a user (emergency use only, by owner)
     */
    function revokeAccess(uint256 datasetId, address user) external onlyOwner {
        require(_accessGrants[datasetId][user], "AccessManager: no access to revoke");
        _accessGrants[datasetId][user] = false;
        emit AccessRevoked(datasetId, user);
    }

    // ─── View Functions ───────────────────────────────────────────────────────

    /**
     * @notice Check if a user has access to a dataset
     */
    function hasAccess(uint256 datasetId, address user) external view returns (bool) {
        return _accessGrants[datasetId][user];
    }

    /**
     * @notice Get count of users with access to a dataset
     */
    function getAccessCount(uint256 datasetId) external view returns (uint256) {
        return _accessList[datasetId].length;
    }

    /**
     * @notice Get all addresses with access to a dataset
     */
    function getAccessList(uint256 datasetId) external view returns (address[] memory) {
        return _accessList[datasetId];
    }
}
