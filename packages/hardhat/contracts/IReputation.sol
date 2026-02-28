// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IReputation {
    function getReputation(address user) external view returns (uint256);
    function increaseReputation(address user, uint256 amount) external;
}
