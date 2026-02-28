// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IReputation.sol";

/**
 * @title Staking
 * @dev Simple staking contract where users can stake ETH and earn reputation points.
 */
contract Staking {
    IReputation public reputation;
    mapping(address => uint256) public balances;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);

    constructor(address reputationAddress) {
        reputation = IReputation(reputationAddress);
    }

    /**
     * @notice Stake ETH to the contract.
     */
    function stake() external payable {
        require(msg.value > 0, "Must stake > 0");
        balances[msg.sender] += msg.value;
        // Increase reputation proportionally (1 point per ether)
        uint256 points = msg.value / 1 ether;
        if (points > 0) {
            reputation.increaseReputation(msg.sender, points);
        }
        emit Staked(msg.sender, msg.value);
    }

    /**
     * @notice Unstake all ETH.
     */
    function unstake() external {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No balance to withdraw");
        balances[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
        emit Unstaked(msg.sender, amount);
    }
}
