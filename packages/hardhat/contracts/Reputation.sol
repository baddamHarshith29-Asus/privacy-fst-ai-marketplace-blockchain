// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IReputation.sol";

/**
 * @title Reputation
 * @dev Simple reputation system where reputation points can be increased by contracts.
 */
contract Reputation is IReputation {
    // Mapping of user address to reputation points
    mapping(address => uint256) private _reputations;

    /**
     * @notice Returns the reputation of a user.
     * @param user The address of the user.
     * @return The reputation points.
     */
    function getReputation(address user) external view override returns (uint256) {
        return _reputations[user];
    }

    /**
     * @notice Increases the reputation of a user.
     * @dev Only callable by authorized contracts (access control can be added later).
     * @param user The address of the user.
     * @param amount The amount to increase.
     */
    function increaseReputation(address user, uint256 amount) external override {
        _reputations[user] += amount;
    }
}
