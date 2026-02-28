// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IReputation.sol";

/**
 * @title Escrow
 * @dev Simple milestone escrow contract integrating with Reputation.
 */
contract Escrow {
    IReputation public reputation;

    enum Status { Pending, Completed, Cancelled }
    struct Milestone {
        address client;
        address provider;
        uint256 amount; // in wei
        Status status;
    }

    uint256 public nextId;
    mapping(uint256 => Milestone) public milestones;

    event EscrowCreated(uint256 indexed id, address indexed client, address indexed provider, uint256 amount);
    event MilestoneCompleted(uint256 indexed id);
    event FundsClaimed(uint256 indexed id, uint256 amount);
    event EscrowCancelled(uint256 indexed id);

    constructor(address reputationAddress) {
        reputation = IReputation(reputationAddress);
    }

    /**
     * @notice Client creates an escrow for a provider and deposits ETH.
     */
    function createEscrow(address provider) external payable returns (uint256) {
        require(msg.value > 0, "Escrow amount must be > 0");
        uint256 id = nextId++;
        milestones[id] = Milestone({
            client: msg.sender,
            provider: provider,
            amount: msg.value,
            status: Status.Pending
        });
        emit EscrowCreated(id, msg.sender, provider, msg.value);
        return id;
    }

    /**
     * @notice Client marks the milestone as completed.
     */
    function markCompleted(uint256 id) external {
        Milestone storage m = milestones[id];
        require(msg.sender == m.client, "Only client can complete");
        require(m.status == Status.Pending, "Not pending");
        m.status = Status.Completed;
        emit MilestoneCompleted(id);
    }

    /**
     * @notice Provider claims the funds after completion.
     */
    function claim(uint256 id) external {
        Milestone storage m = milestones[id];
        require(msg.sender == m.provider, "Only provider can claim");
        require(m.status == Status.Completed, "Milestone not completed");
        uint256 amount = m.amount;
        m.amount = 0;
        m.status = Status.Cancelled; // prevent re-entrancy
        payable(msg.sender).transfer(amount);
        // Reward reputation: 1 point per ether claimed
        uint256 points = amount / 1 ether;
        if (points > 0) {
            reputation.increaseReputation(msg.sender, points);
        }
        emit FundsClaimed(id, amount);
    }

    /**
     * @notice Client can cancel before completion, refunding themselves.
     */
    function cancel(uint256 id) external {
        Milestone storage m = milestones[id];
        require(msg.sender == m.client, "Only client can cancel");
        require(m.status == Status.Pending, "Cannot cancel after completion");
        uint256 amount = m.amount;
        m.amount = 0;
        m.status = Status.Cancelled;
        payable(msg.sender).transfer(amount);
        emit EscrowCancelled(id);
    }
}
