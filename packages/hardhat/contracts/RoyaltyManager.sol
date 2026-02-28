// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./libraries/DatasetLib.sol";

/**
 * @title RoyaltyManager
 * @dev Manages royalty distribution and earnings tracking for the AI Data Marketplace on Monad.
 *      Handles 2% platform fee and 98% provider earnings.
 */
contract RoyaltyManager is Ownable, ReentrancyGuard {
    using DatasetLib for uint256;

    // ─── Constants ────────────────────────────────────────────────────────────

    uint256 public constant PLATFORM_FEE_BPS = 200; // 2% in basis points
    uint256 public constant BASIS_POINTS = 10000;

    // ─── State ────────────────────────────────────────────────────────────────

    address public marketplace;
    address public feeRecipient;

    // provider => pending earnings
    mapping(address => uint256) private _pendingEarnings;

    // Total platform fees collected
    uint256 public totalPlatformFees;

    // Total provider earnings paid out
    uint256 public totalProviderPayouts;

    // ─── Events ───────────────────────────────────────────────────────────────

    event RoyaltyDistributed(
        uint256 indexed datasetId,
        address indexed provider,
        uint256 providerAmount,
        uint256 platformFee
    );
    event EarningsWithdrawn(address indexed provider, uint256 amount);
    event FeeRecipientUpdated(address indexed newRecipient);
    event MarketplaceUpdated(address indexed newMarketplace);

    // ─── Modifiers ────────────────────────────────────────────────────────────

    modifier onlyMarketplace() {
        require(msg.sender == marketplace || msg.sender == owner(), "RoyaltyManager: not authorized");
        _;
    }

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor(address _feeRecipient) Ownable(msg.sender) {
        require(_feeRecipient != address(0), "RoyaltyManager: zero fee recipient");
        feeRecipient = _feeRecipient;
    }

    // ─── External Functions ───────────────────────────────────────────────────

    /**
     * @notice Set the marketplace contract address
     */
    function setMarketplace(address _marketplace) external onlyOwner {
        require(_marketplace != address(0), "RoyaltyManager: zero address");
        marketplace = _marketplace;
        emit MarketplaceUpdated(_marketplace);
    }

    /**
     * @notice Update the fee recipient address
     */
    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "RoyaltyManager: zero address");
        feeRecipient = _feeRecipient;
        emit FeeRecipientUpdated(_feeRecipient);
    }

    /**
     * @notice Distribute incoming payment: platform fee + provider earnings
     * @param datasetId Dataset purchased
     * @param provider Dataset owner
     */
    function distribute(uint256 datasetId, address provider) external payable onlyMarketplace {
        require(msg.value > 0, "RoyaltyManager: zero value");
        require(provider != address(0), "RoyaltyManager: zero provider");

        uint256 platformFee = (msg.value * PLATFORM_FEE_BPS) / BASIS_POINTS;
        uint256 providerEarnings = msg.value - platformFee;

        _pendingEarnings[provider] += providerEarnings;
        totalPlatformFees += platformFee;

        // Send platform fee to fee recipient immediately
        if (platformFee > 0) {
            (bool sent, ) = payable(feeRecipient).call{value: platformFee}("");
            require(sent, "RoyaltyManager: fee transfer failed");
        }

        emit RoyaltyDistributed(datasetId, provider, providerEarnings, platformFee);
    }

    /**
     * @notice Provider withdraws their accumulated earnings
     */
    function withdrawEarnings() external nonReentrant {
        uint256 amount = _pendingEarnings[msg.sender];
        require(amount > 0, "RoyaltyManager: no earnings to withdraw");

        _pendingEarnings[msg.sender] = 0;
        totalProviderPayouts += amount;

        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent, "RoyaltyManager: withdrawal failed");

        emit EarningsWithdrawn(msg.sender, amount);
    }

    // ─── View Functions ───────────────────────────────────────────────────────

    /**
     * @notice Get pending earnings for a provider
     */
    function getPendingEarnings(address provider) external view returns (uint256) {
        return _pendingEarnings[provider];
    }

    /**
     * @notice Emergency: only owner can withdraw contract balance
     */
    function emergencyWithdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "RoyaltyManager: nothing to withdraw");
        (bool sent, ) = payable(owner()).call{value: balance}("");
        require(sent, "RoyaltyManager: emergency withdrawal failed");
    }

    receive() external payable {}
}
